import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource, RDFResourceRolesEnum, RDFTypesEnum, ResourceUtils } from "../models/ARTResources";
import { ConverterContractDescription, ConverterUtils, RDFCapabilityType, XRole } from "../models/Coda";
import { HeaderStruct } from "../models/Sheet2RDF";
import { RDFS } from "../models/Vocabulary";
import { PropertyServices, RangeType } from "../services/propertyServices";
import { Sheet2RDFServices } from "../services/sheet2rdfServices";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../widget/modal/browsingModal/browsingModalServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { DatatypesServices } from "../services/datatypesServices";
import { Observable } from "rxjs";

export class HeaderEditorModalData extends BSModalContext {
    /**
     * This modal get the headerId instead of directly the HeaderStruct in order to prevent changes directly on the HeaderStruct
     * (even if the user discard the modal)
     * @param headerId 
     */
    constructor(public headerId: string, public first: boolean = false) {
        super();
    }
}

@Component({
    selector: "header-editor-modal",
    templateUrl: "./headerEditorModal.html",
})
export class HeaderEditorModal implements ModalComponent<HeaderEditorModalData> {
    context: HeaderEditorModalData;

    private headerName: string;
    private headerId: string;
    private headerResource: ARTURIResource;

    private converterType: RDFCapabilityType;
    private converterUri: string;
    private converterQName: string;
    private converterXRole: XRole = XRole.undetermined;
    private xRoles: XRole[] = [XRole.undetermined, XRole.concept, XRole.conceptScheme, XRole.skosCollection, XRole.xLabel, XRole.xNote];

    private memoize: boolean = false;

    private multiple: boolean;

    private rangeTypes: HeaderRangeType[] = [
        { type: RDFTypesEnum.resource, show: "Resource" }, 
        { type: RDFTypesEnum.plainLiteral, show: "Plain Literal" },
        { type: RDFTypesEnum.typedLiteral, show: "Typed Literal" },
        { type: RDFTypesEnum.undetermined, show: "-----" }
    ];
    private selectedRangeType: HeaderRangeType;
    private rangeTypeChangeable: boolean; //tells if the range type of the property is changeable. 
        //"true" only if the property assigned to the header is undetermined (so leave the choice to the user)
    
    
    private rangeClasses: ARTURIResource[];
    private selectedRangeClass: ARTURIResource;
    private rangeClassChangeable: boolean; //tells if the range class of the resource is changeable (if it's possible to add classes). 
        //"true" only if the property assigned to the header doesn't have rangeCollection (so leave the choice to the user), or it contains rdfs:Resource
    private nullRangeClass: ARTURIResource = new ARTURIResource("-----"); //fake IRI that stands for "no range class"

    private language: string;
    private datatype: ARTURIResource;
    private datatypeList: ARTURIResource[] = [];

    constructor(public dialog: DialogRef<HeaderEditorModalData>, private s2rdfService: Sheet2RDFServices, 
        private propService: PropertyServices, private datatypeService: DatatypesServices,
        private basicModals: BasicModalServices, private browingModals: BrowsingModalServices, private sharedModals: SharedModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.s2rdfService.getHeaderFromId(this.context.headerId).subscribe(
            header => {
                this.headerName = header.name;
                this.headerId = header.id;
                this.headerResource = header.resource;
                this.converterType = header.converter.type;
                this.converterUri = header.converter.uri;
                this.converterXRole = (header.converter.xRole) ? header.converter.xRole : XRole.undetermined;
                this.memoize = header.converter.memoize;
                if (this.converterUri != null) {
                    this.converterQName = ConverterUtils.getConverterQName(this.converterUri);
                }
                this.multiple = header.isMultiple;

                //init selectedRangeType
                this.rangeTypes.forEach((t: HeaderRangeType) => {
                    if (t.type+"" == header.range.type+"") {
                        this.selectedRangeType = t;
                    }
                });

                this.rangeClasses = [this.nullRangeClass];
                this.selectedRangeClass = this.nullRangeClass;
                if (header.range.resource != null) {
                    this.rangeClasses.push(header.range.resource);
                    this.selectedRangeClass = this.rangeClasses[this.rangeClasses.length-1];
                }

                if (header.range.type == RDFTypesEnum.typedLiteral) {
                    //try to init datatype
                    let rngDatatype: ARTURIResource = header.range.resource; //in case of range type 'literal', the cls tells the datatype
                    console.log("rngDatatype", rngDatatype);
                    if (rngDatatype != null) {
                        this.datatype = rngDatatype;
                        this.initDatatypeList();
                    }
                }
                if (header.range.type == RDFTypesEnum.plainLiteral) {
                    //try to init language
                    if (header.range.lang != null) {
                        this.language = header.range.lang;
                    }
                }
                
                if (this.isHeaderResourceProperty()) {
                    this.updateHeaderPropertyRange(header);
                }
            }
        );
    }

    /**
     * Browse the property tree in order to assing a property to the header
     */
    private assignPropertyToHeader() {
        this.browingModals.browsePropertyTree("Select property").then(
            (property: ARTURIResource) => {
                this.headerResource = property;
                this.updateHeaderPropertyRange();
            },
            () => {}
        )
    }

    /**
     * Update the information about the property range in the modal (range type and range class)
     * @param header the header retrieved from server: it is optional, 
     *  if provided it is usefult to restore the status stored in the server-side model
     */
    updateHeaderPropertyRange(header?: HeaderStruct) {
        //update range type, class, ...
        this.propService.getRange(this.headerResource).subscribe(
            range => {
                if (range.ranges.type != RDFTypesEnum.undetermined+"") {
                    this.rangeTypes.forEach((t: HeaderRangeType) => {
                        if (t.type+"" == range.ranges.type+"") {
                            this.selectedRangeType = t;
                        }
                    });
                }
                this.rangeTypeChangeable = range.ranges.type == RangeType.undetermined;
                //if a collection of admitted range classes is provided
                if (range.ranges.rangeCollection != null) {
                    this.rangeClasses = [this.nullRangeClass];
                    this.selectedRangeClass = this.nullRangeClass;
                    this.rangeClasses.push(...range.ranges.rangeCollection.resources);
                    this.rangeClassChangeable = ResourceUtils.containsNode(this.rangeClasses, RDFS.resource);
                } else {
                    this.rangeClassChangeable = true;
                }

                //try to restore the model
                if (header != null) {
                    //set the range type stored
                    let rngType: RDFTypesEnum = header.range.type;
                    this.rangeTypes.forEach((t: HeaderRangeType) => {
                        if (t.type == rngType) {
                            this.selectedRangeType = t;
                        }
                    });

                    if (rngType == RDFTypesEnum.resource) {
                        //try to init range class
                        let rngClass: ARTURIResource = header.range.resource; //in case of range type 'resource', the cls tells the range class of the prop
                        if (rngClass != null) {
                            let rngClassIdx: number = ResourceUtils.indexOfNode(this.rangeClasses, rngClass);
                            if (rngClassIdx != -1) { //rngClass already among the listed range classes
                                this.selectedRangeClass = this.rangeClasses[rngClassIdx];
                            } else {
                                this.rangeClasses.push(rngClass);
                                this.selectedRangeClass = rngClass;
                            }
                        }
                    }

                }
            }
        )
    }

    /**
     * Browse the class tree in order to assing a class to the header (only available if the modal is open from the first column)
     */
    private assignClassToHeader() {
        this.browingModals.browseClassTree("Select class").then(
            (cls: ARTURIResource) => {
                this.headerResource = cls;
            },
            () => {}
        );
    }

    /**
     * Tells if the resoruce assigned to the resource is a property (not a class)
     */
    private isHeaderResourceProperty(): boolean {
        if (this.headerResource) {
            return ResourceUtils.roleSubsumes(RDFResourceRolesEnum.property, this.headerResource.getRole());
        }
        return false;
    }

    /**
     * Adds a class to the range list (the range class is useful during the pearl generation in case it is desired to 
     * state a class membership of the node in the graph section)
     */
    private addRangeClass() {
        this.browingModals.browseClassTree("Select class").then(
            (cls: ARTURIResource) => {
                this.rangeClasses.push(cls);
                this.selectedRangeClass = cls;
            }
        );
    }

    private chooseConverter() {
        let capabilities: RDFCapabilityType[] = [];
        if (this.headerResource != null && this.headerResource.getRole() == RDFResourceRolesEnum.cls) {
            capabilities.push(RDFCapabilityType.uri);
        } else {
            if (this.selectedRangeType != null) {
                if (this.selectedRangeType.type == RDFTypesEnum.typedLiteral || this.selectedRangeType.type == RDFTypesEnum.plainLiteral) {
                    capabilities.push(RDFCapabilityType.literal);
                } else if (this.selectedRangeType.type == RDFTypesEnum.resource) {
                    capabilities.push(RDFCapabilityType.uri)
                }
            }
        }
        this.sharedModals.selectConverter("Select converter", null, capabilities).then(
            (converter: {projectionOperator: string, contractDesctiption: ConverterContractDescription }) => {
                let capabilityType: RDFCapabilityType = converter.contractDesctiption.getRDFCapability();
                if (capabilityType == RDFCapabilityType.uri) {
                    this.converterType = RDFCapabilityType.uri;
                } else if (capabilityType == RDFCapabilityType.typedLiteral || capabilityType == RDFCapabilityType.literal) {
                    this.converterType = RDFCapabilityType.literal;
                } else if (capabilityType == RDFCapabilityType.node) {
                    this.converterType = converter.projectionOperator.startsWith('uri') ? RDFCapabilityType.uri : RDFCapabilityType.literal;
                }
                this.converterUri = converter.contractDesctiption.getURI();
                this.converterQName = ConverterUtils.getConverterQName(this.converterUri);
            },
            () => {}
        )
    }

    private isConverterRandom(): boolean {
        return this.converterUri == "http://art.uniroma2.it/coda/contracts/randIdGen";
    }

    private onRangeTypeChange() {
        if (this.selectedRangeType.type == RDFTypesEnum.typedLiteral) {
            if (this.datatypeList.length == 0) { //if datatype list is empty => initialize it
                this.initDatatypeList().subscribe();
            }
        }
    }

    private initDatatypeList(): Observable<any> {
        if (this.datatypeList.length == 0) {
            return this.datatypeService.getDatatypes().map(
                datatypes => {
                    datatypes.sort((dt1: ARTURIResource, dt2: ARTURIResource) => {
                        return dt1.getShow().localeCompare(dt2.getShow());
                    });
                    this.datatypeList = datatypes;

                    console.log("this.datatype", this.datatype);
                    this.datatypeList.forEach(dt => {
                        if (dt.getURI() == this.datatype.getURI()) {
                            this.datatype = dt;
                        }
                    });
                }
            );
        }
    }

    ok(event: Event) {
        if (this.multiple) {
            this.basicModals.confirm("Edit header", "There are multiple header with the same name (" + this.headerName 
                + "). Do you want to apply the same changes to all of them?", "warning").then(
                (confirm: any) => {
                    this.updateHeader(true);
                },
                () => {
                    this.updateHeader(false);
                }
            )
        } else {
            this.updateHeader();
        }
        event.stopPropagation();
    }

    private updateHeader(applyToAll?: boolean) {
        let rangeTypePar: RDFTypesEnum;
        let rangeClassPar: ARTURIResource;
        if (this.isHeaderResourceProperty()) {
            rangeTypePar = this.selectedRangeType.type;
            if (this.selectedRangeClass != this.nullRangeClass) {
                rangeClassPar = this.selectedRangeClass;
            }
        }

        let langPar: string = this.language;
        let datatypePar: ARTURIResource = this.datatype;
        /**
         * According to the literal range type, remove the "other" parameter:
         * - if typedLiteral avoid to pass the language
         * - if plain avoid to pass the datatype.
         * This is necessary in order to "disambiguate" the serialization of literal converter server-side.
         * If both lang and datatype are passed (language taken from header, datatype assigned through the editor), 
         * the server don't know which serialization adopt between literal@xy or literal^^<dt>
         * 
         * In case the range type is uri, leave them both since in some scenario they could be useful
         * (e.g. for XLabel, the range type is uri, but the language is still necessary)
         */
        if (rangeTypePar == RDFTypesEnum.typedLiteral) {
            langPar = null;
        } else if (rangeTypePar == RDFTypesEnum.plainLiteral) {
            datatypePar = null;
        }

        let xRolePar: XRole = null;
        if (this.converterXRole != XRole.undetermined) {
            xRolePar = this.converterXRole;
        }

        this.s2rdfService.updateHeader(this.headerId, this.headerResource, rangeTypePar, rangeClassPar, langPar, datatypePar,
            this.converterQName, this.converterType, xRolePar, this.memoize, applyToAll).subscribe(
            stResp => {
                this.dialog.close();
            }
        )
    }

    cancel() {
        this.dialog.dismiss();
    }

}

class HeaderRangeType {
    type: RDFTypesEnum;
    show: string;
}