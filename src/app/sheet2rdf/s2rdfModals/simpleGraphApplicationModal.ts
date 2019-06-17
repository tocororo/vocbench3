import { Component } from "@angular/core";
import { DialogRef, Modal, ModalComponent, OverlayConfig } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { Observable } from "rxjs";
import { ARTURIResource } from "../../models/ARTResources";
import { ConverterContractDescription, RDFCapabilityType } from "../../models/Coda";
import { NodeConversion, SimpleGraphApplication, SimpleHeader } from "../../models/Sheet2RDF";
import { RDFS } from "../../models/Vocabulary";
import { PropertyServices, RangeType } from "../../services/propertyServices";
import { ResourcesServices } from "../../services/resourcesServices";
import { Sheet2RDFServices } from "../../services/sheet2rdfServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { VBContext } from "../../utils/VBContext";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { NodeCreationModal, NodeCreationModalData } from "./nodeCreationModal";

export class SimpleGraphApplicationModalData extends BSModalContext {
    /**
     * @param graphApplication optional graph application to edit. If not provided the modal create a new graph application
     */
    constructor(public header: SimpleHeader, public graphApplication?: SimpleGraphApplication) {
        super();
    }
}

@Component({
    selector: "simple-graph-modal",
    templateUrl: "./simpleGraphApplicationModal.html",
})
export class SimpleGraphApplicationModal implements ModalComponent<SimpleGraphApplicationModalData> {
    context: SimpleGraphApplicationModalData;

    private property: ARTURIResource; //property used in graph section

    /**
     * Range type
     */
    private resourceRangeType: HeaderRangeType = { type: RangeType.resource, show: "Resource" };
    private plainLiteralRangeType: HeaderRangeType = { type: RangeType.plainLiteral, show: "Plain Literal" };
    private typedLiteralRangeType: HeaderRangeType = { type: RangeType.typedLiteral, show: "Typed Literal" };
    private rangeTypes: HeaderRangeType[];
    private selectedRangeType: HeaderRangeType;
    //tells if the range type of the property is changeable (only if the property range type is undetermined (so leave the choice to the user))
    private rangeTypeChangeable: boolean; 

    /**
     * Refinement following the range type:
     * - type assertion
     * - language
     * - datatype
     */
    private rangeCollection: ARTURIResource[]; //all the range classes of the selected property
    //when rangeType is 'resource', user can select the range class to assert
    private assertType: boolean = false;
    private assertableTypes: ARTURIResource[];
    private assertedType: ARTURIResource;
    //when rangeType is 'plainLiteral', user can select the language to assert
    private language: string;
    //when rangeType is 'typedLiteral', user can select the datatype to assert
    private datatype: ARTURIResource;
    private allowedDatatypes: ARTURIResource[];

    /**
     * Node
     */
    private availableNodes: NodeConversion[] = [];
    private selectedNode: NodeConversion;

    constructor(public dialog: DialogRef<SimpleGraphApplicationModalData>, private s2rdfService: Sheet2RDFServices,
        private propService: PropertyServices,  private resourceService: ResourcesServices,
        private browsingModals: BrowsingModalServices, private modal: Modal) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.rangeTypes = [this.resourceRangeType, this.plainLiteralRangeType, this.typedLiteralRangeType];
        this.availableNodes.push(...this.context.header.nodes);

        /**
         * If there is only a node available, check if it has a language/datatype. In case inizializes its selection.
         * This operation is useful for presetting language/datatype if they are inferred from the header name.
         * In this case, during the inizialization, sheet2rdf creates a node (for the header) with the detected language/datatype
         */
        if (this.availableNodes.length == 1 && this.availableNodes[0].converter != null) {
            if (this.availableNodes[0].converter.language != null) {
                this.language = this.availableNodes[0].converter.language;
            } else if (this.availableNodes[0].converter.datatypeUri != null) {
                this.datatype = new ARTURIResource(this.availableNodes[0].converter.datatypeUri);
            }
        }

        if (this.context.graphApplication != null) {
            //restore property and related info (range, range type, ...)
            this.property = this.context.graphApplication.property;
            if (this.property != null) {
                this.updateHeaderPropertyRange();
            }
            //restore selected node
            this.availableNodes.forEach(n => {
                if (n.nodeId == this.context.graphApplication.nodeId) {
                    this.selectedNode = n;
                }
            })
        }
    }

    /**
     * Browse the property tree in order to select a property
     */
    private changeProperty() {
        this.browsingModals.browsePropertyTree("Select property").then(
            (property: ARTURIResource) => {
                this.property = property;
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
    updateHeaderPropertyRange() {
        //reset range, resource type, assertable types, datatypes
        this.rangeCollection = [];
        this.rangeTypes = [this.resourceRangeType, this.plainLiteralRangeType, this.typedLiteralRangeType];
        this.selectedRangeType = null;
        this.assertableTypes = [];
        this.assertedType = null;
        this.allowedDatatypes = [];
        //update range type, class, ...
        this.propService.getRange(this.property).subscribe(
            range => {
                if (range.ranges.type != RangeType.undetermined) {
                    this.rangeTypes.forEach((t: HeaderRangeType) => {
                        if (t.type == range.ranges.type) {
                            this.selectedRangeType = t;
                        }
                    });
                }
                this.rangeTypeChangeable = range.ranges.type == RangeType.undetermined;
                //if a collection of admitted range classes is provided
                if (range.ranges.rangeCollection != null) {
                    let rangeColl: ARTURIResource[] = range.ranges.rangeCollection.resources;
                    
                    //special case
                    if (ResourceUtils.containsNode(rangeColl, RDFS.literal)) {
                        //if range contains rdfs:Literal range type should be changeable only between typed and plain literal
                        this.rangeTypeChangeable = true;
                        if (rangeColl.length == 1) { //if rdfs:Literal is the only range, limit the selection of literal range types
                            this.rangeTypes = [this.plainLiteralRangeType, this.typedLiteralRangeType];
                        }
                    }
                    //selected range type typedLiteral => rangeCollection contains the admitted datatype, so limit it
                    if (this.selectedRangeType != null && this.selectedRangeType.type == RangeType.typedLiteral) {
                        this.allowedDatatypes = rangeColl;
                    } else {
                        this.annotateResources(rangeColl).subscribe(
                            () => {
                                this.rangeCollection.push(...rangeColl);
                                this.assertableTypes.push(...rangeColl);
                                //if the modal is editing a graph application, try to restore the asserted type
                                if (this.context.graphApplication != null) {
                                    let type = this.context.graphApplication.type;
                                    if (type != null) {
                                        this.assertType = true;
                                        let typeIdx = ResourceUtils.indexOfNode(this.assertableTypes, type);
                                        if (typeIdx != -1) { //type already in the assertableTypes list
                                            this.assertedType = this.assertableTypes[typeIdx];
                                        } else { //type not in the assertableTypes list (probably the user added it manually)
                                            this.assertableTypes.push(type);
                                            this.assertedType = this.assertableTypes[this.assertableTypes.length-1];
                                        }
                                    }
                                }
                            }
                        );
                    }
                    
                }

                // try to restore the model about the node
                if (this.context.graphApplication != null) {
                    //select the node
                    let nodeId = this.context.graphApplication.nodeId;
                    this.availableNodes.forEach(n => {
                        if (n.nodeId == nodeId) {
                            this.selectedNode = n;
                        }
                    });
                    //if a converter is provided, set the range type, eventually the datatype and language
                    if (this.selectedNode.converter != null) {
                        if (this.selectedNode.converter.datatypeUri != null) {
                            this.forceRangeType(RangeType.typedLiteral);
                            this.datatype = new ARTURIResource(this.selectedNode.converter.datatypeUri);
                            // this.selectDatatype(new ARTURIResource(this.selectedNode.converter.datatype));
                        } else if (this.selectedNode.converter.language != null) {
                            this.forceRangeType(RangeType.plainLiteral);
                            this.language = this.selectedNode.converter.language;
                        }
                    }

                }
            }
        )
    }

    private forceRangeType(rngType: RangeType) {
        this.rangeTypes.forEach(t => {
            if (t.type == rngType) {
                this.selectedRangeType = t;
            }
        });
    }

    /**
     * Adds a class to the range list (the range class is useful during the pearl generation in case it is desired to 
     * state a class membership of the node in the graph section)
     */
    private addAssertedType() {
        this.browsingModals.browseClassTree("Select class", this.rangeCollection).then(
            (cls: ARTURIResource) => {
                if (!ResourceUtils.containsNode(this.assertableTypes, cls)) {
                    this.assertableTypes.push(cls);
                    this.assertedType = cls;
                }
            }
        );
    }


    /**
     * The selection/creation of a node, is enabled only if the property is set and, if the rangeType is typedLiteral, a datatype is selected.
     * This constraints are necessary since the choice of the converter in a node definition depends on the range type and eventually
     * on the datatype (the choosable converters rdf capability and datatypes must be compliant respectively to the selected rangeType and datatype)
     */
    private isNodeSelectionEnabled(): boolean {
        if (this.property == null || this.selectedRangeType == null) {
            return false;
        } else {
            return !(this.selectedRangeType.type == RangeType.typedLiteral && this.datatype == null);
        }
    }

    private getNodeSerialization(n: NodeConversion) {
        let s = n.nodeId;
        if (n.converter != null) {
            s += " " + n.converter.type;
            if (n.converter.contractUri == ConverterContractDescription.NAMESPACE + "default") { //the default converter
                if (n.converter.language != null) {
                    s += "@" + n.converter.language;
                }
                if (n.converter.datatypeUri != null) {
                    s += "^^" + ResourceUtils.getQName(n.converter.datatypeUri, VBContext.getPrefixMappings());
                }
            } else { //not the default converter
                s += "(";
                s += n.converter.contractUri.replace(ConverterContractDescription.NAMESPACE, ConverterContractDescription.PREFIX + ":");
                if (JSON.stringify(n.converter.params) != "{}") { //if params specified
                    s += "(...)";
                }
                s += ")";
            }
        } 
        return s;
    }

    private addNode() {
        let dt: ARTURIResource = (this.selectedRangeType.type == RangeType.typedLiteral) ? this.datatype : null;
        let lang: string = (this.selectedRangeType.type == RangeType.plainLiteral) ? this.language : null;
        var modalData = new NodeCreationModalData(this.context.header, null, this.selectedRangeType.type, lang, dt, this.availableNodes);
        const builder = new BSModalContextBuilder<NodeCreationModalData>(
            modalData, undefined, NodeCreationModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        this.modal.open(NodeCreationModal, overlayConfig).result.then(
            (node: NodeConversion) => {
                this.availableNodes.push(node);
                this.selectedNode = node;
            },
            () => {}
        );
    }

    /**
     * Check if the selected node is compliant with the choices in the graph application, in case it is not compliant
     * returns the error message
     */
    private getNodeNotCompliantError(): string {
        let err: string = null;
        if (this.selectedNode != null && this.selectedNode.converter != null && this.selectedRangeType != null) {
            //if range type is resource, node is not compliant if its converter capability is not uri
            if (this.selectedRangeType.type == RangeType.resource && this.selectedNode.converter.type != RDFCapabilityType.uri) { 
                err = "the type of converter used to create the node (" + this.selectedNode.converter.type + 
                    ") is not compliant with the selected range type (" + this.selectedRangeType.show + ")";
            } else if (this.selectedRangeType.type == RangeType.plainLiteral) { 
                //if range type is plain literal, node is not compliant if its converter capability is not literal...
                if (this.selectedNode.converter.type != RDFCapabilityType.literal) {
                    err = "the type of converter used to create the node (" + this.selectedNode.converter.type + 
                        ") is not compliant with the selected range type (" + this.selectedRangeType.show + ")";
                } else { //...or if it is literal but...
                    if (this.selectedNode.converter.datatypeUri != null) { //or a datatype
                        err = "the used converter creates a typed literal (" + 
                            ResourceUtils.getQName(this.selectedNode.converter.datatypeUri, VBContext.getPrefixMappings()) +
                            ") instead of a language tagged literal.";
                    } else if (this.selectedNode.converter.language != this.language) { //has a different language
                        err = "the chosen language is not the same of the converter used to create the node";
                    }
                }
            } else if (this.selectedRangeType.type == RangeType.typedLiteral) {
                //if range type is typed literal, node is not compliant if its converter capability is not literal
                if (this.selectedNode.converter.type != RDFCapabilityType.literal) {
                    err = "the type of converter used to create the node (" + this.selectedNode.converter.type + 
                        ") is not compliant with the selected range type (" + this.selectedRangeType.show + ")";
                } else { //...or if it is literal but...
                    if (this.selectedNode.converter.language != null) { //or a language
                        err = "the used converter creates a language tagged literal instead of a typed literal";
                    } else if (this.datatype == null || this.selectedNode.converter.datatypeUri != this.datatype.getURI()) { //has a different datatype
                        err = "the chosen datatype is not the same of the converter used to create the node";
                    }
                }
            }
        }
        if (err != null) {
            return "The selected node is not compliant with the choices made: " + err;
        }
        return err; //compliant in any other cases
    }


    private isOkEnabled(): boolean {
        //just check if node is compliant. Since node is provided only when property, and range type are provided, this check could be enough
        return this.selectedNode != null && this.getNodeNotCompliantError() == null;
    }

    ok() {
        //check if the selected node has been created contextually or it was already among the available in the header
        let exist: boolean = false;
        this.context.header.nodes.forEach(n => {
            if (n.nodeId == this.selectedNode.nodeId) {
                exist = true;
            }
        })
        //if it didn't exist, create it and then create/update the graph application
        if (!exist) {
            this.s2rdfService.addNodeToHeader(this.context.header.id, this.selectedNode.nodeId, this.selectedNode.converter.type,
                this.selectedNode.converter.contractUri, this.selectedNode.converter.datatypeUri, this.selectedNode.converter.language, this.selectedNode.converter.params,
                this.selectedNode.memoize).subscribe(
                resp => {
                    this.createOrUpdateGraphApplication();
                }
            );
        } else { //if it did exist, there is no need to create it, it's enough to set the nodeId of the graph application
            this.createOrUpdateGraphApplication();
        }
    }

    private createOrUpdateGraphApplication() {
        let type: ARTURIResource;
        if (this.selectedRangeType.type == RangeType.resource && this.assertType) {
            type = this.assertedType;
        }
        let graphAppFn: Observable<any>;
        if (this.context.graphApplication == null) { //create mode
            graphAppFn = this.s2rdfService.addSimpleGraphApplicationToHeader(this.context.header.id, this.property, this.selectedNode.nodeId, type);
        } else { //edit mode
            graphAppFn = this.s2rdfService.updateSimpleGraphApplication(this.context.header.id, this.context.graphApplication.id, this.property, this.selectedNode.nodeId, type);
        }
        graphAppFn.subscribe(
            resp => {
                this.dialog.close();
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

    /**
     * Annotates a not-annotated list of ARTURIResource
     * @param resources 
     */
    private annotateResources(resources: ARTURIResource[]): Observable<any> {
        return this.resourceService.getResourcesInfo(resources).map(
            annotated => {
                for (let i = 0; i < resources.length; i++) {
                    resources[i] = annotated[ResourceUtils.indexOfNode(annotated, resources[i])];
                }
            }
        )
    }

}

class HeaderRangeType {
    type: RangeType;
    show: string;
}