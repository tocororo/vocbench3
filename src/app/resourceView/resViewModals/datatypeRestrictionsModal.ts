import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Observable } from "rxjs";
import { ARTBNode, ARTLiteral, ARTURIResource } from "../../models/ARTResources";
import { DatatypeRestrictionDescription, FacetsRestriction } from "../../models/Datatypes";
import { XmlSchema } from "../../models/Vocabulary";
import { DatatypesServices } from "../../services/datatypesServices";
import { DatatypeValidator } from "../../utils/DatatypeValidator";
import { ManchesterCtx } from "../../widget/codemirror/manchesterEditor/manchesterEditorComponent";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

export class DataTypeRestrictionsModalData extends BSModalContext {
    constructor(
        public title: string,
        public datatype: ARTURIResource,
        public restriction: ARTBNode, //if provided, allow to edit
    ) {
        super();
    }
}

@Component({
    selector: "datatype-restrictions-modal",
    templateUrl: "./datatypeRestrictionsModal.html",
})
export class DataTypeRestrictionsModal implements ModalComponent<DataTypeRestrictionsModalData> {
    context: DataTypeRestrictionsModalData;

    private readonly ASPECT_FACETS: string = "Facets";
    private readonly ASPECT_MANCHESTER: string = "Manchester";
    private readonly ASPECT_ENUMERATION: string = "Enumeration";
    private aspectSelectors: string[] = [
        this.ASPECT_FACETS, 
        this.ASPECT_MANCHESTER, 
        this.ASPECT_ENUMERATION
    ];
    private selectedAspect: string = this.ASPECT_FACETS;

    /* Facets */
    private facetsDescription: FacetsRestriction;

    /* manchester */
    private manchesterCtx: ManchesterCtx;
    private manchExpr: string;

    /* enumeration */
    private literalEnumerations: ARTLiteral[] = [];

    constructor(public dialog: DialogRef<DataTypeRestrictionsModalData>, private datatypeService: DatatypesServices,
        private basicModals: BasicModalServices, private dtValidator: DatatypeValidator) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.restriction != null) {
            //init restriction description (facets or enumerations based)
            this.datatypeService.getRestrictionDescription(this.context.restriction).subscribe(
                (description: DatatypeRestrictionDescription) => {
                    if (description.facets != null) {
                        this.facetsDescription = description.facets;
                        this.selectedAspect = this.ASPECT_FACETS;
                        this.manchesterCtx = ManchesterCtx.datatypeFacets;
                    } else if (description.enumerations != null) {
                        this.literalEnumerations = description.enumerations;
                        this.selectedAspect = this.ASPECT_ENUMERATION;
                        this.manchesterCtx = ManchesterCtx.datatypeEnumeration;
                    }
                }
            );
            //init manchester expression
            this.manchExpr = this.context.restriction.getShow(); //the show of a restriction is already a manchester expression
        }
    }

    onEnumerationChanged(datarange: ARTLiteral[]) {
        this.literalEnumerations = datarange;
    }

    ok(event: Event) {
        let actionFn: Observable<void>;
        if (this.selectedAspect == this.ASPECT_FACETS) {
            actionFn = this.getApplyFacetsFn();
        } else if (this.selectedAspect == this.ASPECT_MANCHESTER) {
            actionFn = this.getApplyManchesterFn();
        } else if (this.selectedAspect == this.ASPECT_ENUMERATION) {
            actionFn = this.getApplyEnumerationFn();
        }
        if (actionFn != null) { //check if not null, if null something is gone wrong in the getApply... method (e.g. invalid data)
            actionFn.subscribe(
                () => {
                    this.dtValidator.initDatatypeRestrictions(); //restriction edited => update the in-memory restrictions
                    event.stopPropagation();
                    event.preventDefault();
                    this.dialog.close();
                }
            );
        }
    }

    cancel() {
        this.dialog.dismiss();
    }

    private getApplyManchesterFn(): Observable<void> {
        if (this.manchExpr != null) {
            return this.datatypeService.setDatatypeManchesterRestriction(this.context.datatype, this.manchExpr);
        } else {
            this.basicModals.alert("Empty expression", "You have to provide a valid manchester expression.", "warning");
            return null;
        }
    }

    private getApplyEnumerationFn(): Observable<void> {
        if (this.literalEnumerations != null && this.literalEnumerations.length > 0) {
            return this.datatypeService.setDatatypeEnumerationRestrictions(this.context.datatype, this.literalEnumerations);
        } else {
            this.basicModals.alert("Missing values", "You have to provide at least one value.", "warning");
            return null;
        }
    }

    private getApplyFacetsFn(): Observable<void> {
        //check that at least one facet has been provided
        if (this.facetsDescription.facets.minExclusive == null && this.facetsDescription.facets.minInclusive == null && 
            this.facetsDescription.facets.maxExclusive == null && this.facetsDescription.facets.maxInclusive == null &&
            (this.facetsDescription.facets.pattern == null || this.facetsDescription.facets.pattern.trim() == "")
        ) {
            this.basicModals.alert("Missing facets", "No facets has been provided. Please, fill at least one of the available facets", "warning");
            return null;
        }

        //check that min and max are consistent (min lower than max)
        let min = this.facetsDescription.facets.minExclusive;
        if (min == null) {
            min = this.facetsDescription.facets.minInclusive;
        }
        let max = this.facetsDescription.facets.maxExclusive;
        if (max == null) {
            max = this.facetsDescription.facets.maxInclusive;
        }
        if (min != null && max != null && min >= max) {
            this.basicModals.alert("Invalid facets", "The minimun and maximum facets are inconsistent.", "warning");
            return null;
        }

        //check that the given pattern is valid for a regex
        if (this.facetsDescription.facets.pattern != null) {
            try {
                new RegExp(this.facetsDescription.facets.pattern);
            } catch (e) {
                this.basicModals.alert("Invalid pattern", "The provided pattern is not valid", "warning");
                return null;
            }
        }

        let facetsMap: { [facet: string]: string } = {};
        if (this.facetsDescription.facets.pattern != null && this.facetsDescription.facets.pattern.trim() != "") {
            facetsMap[XmlSchema.pattern.toNT()] = new ARTLiteral(this.facetsDescription.facets.pattern + "").toNT();
        }
        if (this.facetsDescription.facets.minExclusive != null) {
            let dt: string = Number.isInteger(this.facetsDescription.facets.minExclusive) ? XmlSchema.integer.getURI() : XmlSchema.decimal.getURI();
            facetsMap[XmlSchema.minExclusive.toNT()] = new ARTLiteral(this.facetsDescription.facets.minExclusive + "", dt).toNT();
        }
        if (this.facetsDescription.facets.minInclusive != null) {
            let dt: string = Number.isInteger(this.facetsDescription.facets.minExclusive) ? XmlSchema.integer.getURI() : XmlSchema.decimal.getURI();
            facetsMap[XmlSchema.minInclusive.toNT()] = new ARTLiteral(this.facetsDescription.facets.minInclusive + "", dt).toNT();
        }
        if (this.facetsDescription.facets.maxExclusive != null) {
            let dt: string = Number.isInteger(this.facetsDescription.facets.minExclusive) ? XmlSchema.integer.getURI() : XmlSchema.decimal.getURI();
            facetsMap[XmlSchema.maxExclusive.toNT()] = new ARTLiteral(this.facetsDescription.facets.maxExclusive + "", dt).toNT();
        }
        if (this.facetsDescription.facets.maxInclusive != null) {
            let dt: string = Number.isInteger(this.facetsDescription.facets.minExclusive) ? XmlSchema.integer.getURI() : XmlSchema.decimal.getURI();
            facetsMap[XmlSchema.maxInclusive.toNT()] = new ARTLiteral(this.facetsDescription.facets.maxInclusive + "", dt).toNT();
        }
        return this.datatypeService.setDatatypeFacetsRestriction(this.context.datatype, this.facetsDescription.base, facetsMap);
    }

}