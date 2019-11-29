import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Observable } from "rxjs";
import { ARTBNode, ARTLiteral, ARTURIResource } from "../../models/ARTResources";
import { DatatypeRestrictionDescription } from "../../models/Datatypes";
import { XmlSchema } from "../../models/Vocabulary";
import { DatatypesServices } from "../../services/datatypesServices";
import { ManchesterServices } from "../../services/manchesterServices";
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
        // this.ASPECT_ENUMERATION
    ];
    private selectedAspect: string = this.ASPECT_FACETS;

    private description: DatatypeRestrictionDescription;

    private manchesterCtx: ManchesterCtx = ManchesterCtx.datatype;
    private manchExpr: string;

    constructor(public dialog: DialogRef<DataTypeRestrictionsModalData>, private datatypeService: DatatypesServices, private manchService: ManchesterServices,
        private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.restriction != null) {
            //init restriction description
            this.datatypeService.getRestrictionDescription(this.context.restriction).subscribe(
                (description: DatatypeRestrictionDescription) => {
                    this.description = description;
                }
            );
            //init manchester expression
            this.manchExpr = this.context.restriction.getShow(); //the show of a restriction is already a manchester expression
        }
    }

    ok(event: Event) {
        let actionFn: Observable<void>;
        if (this.selectedAspect == this.ASPECT_FACETS) {
            actionFn = this.getApplyFacetsFn();
        } else if (this.selectedAspect == this.ASPECT_MANCHESTER) {
            actionFn = this.getApplyManchesterFn();
        }
        if (actionFn != null) { //check if not null, if null something is gone wrong in the getApply... method (e.g. invalid data)
            actionFn.subscribe(
                () => {
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
            return null;
        }
    }

    private getApplyFacetsFn(): Observable<void> {
        //check that at least one facet has been provided
        if (this.description.facets.minExclusive == null && this.description.facets.minInclusive == null && 
            this.description.facets.maxExclusive == null && this.description.facets.maxInclusive == null &&
            (this.description.facets.pattern == null || this.description.facets.pattern.trim() == "")
        ) {
            this.basicModals.alert("Missing facets", "No facets has been provided. Please, fill at least one of the available facets", "warning");
            return null;
        }

        //check that min and max are consistent (min lower than max)
        let min = this.description.facets.minExclusive;
        if (min == null) {
            min = this.description.facets.minInclusive;
        }
        let max = this.description.facets.maxExclusive;
        if (max == null) {
            max = this.description.facets.maxInclusive;
        }
        if (min != null && max != null && min >= max) {
            this.basicModals.alert("Invalid facets", "The minimun and maximum facets are inconsistent.", "warning");
            return null;
        }

        //check that the given pattern is valid for a regex
        if (this.description.facets.pattern != null) {
            try {
                new RegExp(this.description.facets.pattern);
            } catch (e) {
                this.basicModals.alert("Invalid pattern", "The provided pattern is not valid", "warning");
                return null;
            }
        }

        let facetsMap: { [facet: string]: string } = {};
        if (this.description.facets.pattern != null && this.description.facets.pattern.trim() != "") {
            facetsMap[XmlSchema.pattern.toNT()] = new ARTLiteral(this.description.facets.pattern + "").toNT();
        }
        if (this.description.facets.minExclusive != null) {
            let dt: string = Number.isInteger(this.description.facets.minExclusive) ? XmlSchema.integer.getURI() : XmlSchema.decimal.getURI();
            facetsMap[XmlSchema.minExclusive.toNT()] = new ARTLiteral(this.description.facets.minExclusive + "", dt).toNT();
        }
        if (this.description.facets.minInclusive != null) {
            let dt: string = Number.isInteger(this.description.facets.minExclusive) ? XmlSchema.integer.getURI() : XmlSchema.decimal.getURI();
            facetsMap[XmlSchema.minInclusive.toNT()] = new ARTLiteral(this.description.facets.minInclusive + "", dt).toNT();
        }
        if (this.description.facets.maxExclusive != null) {
            let dt: string = Number.isInteger(this.description.facets.minExclusive) ? XmlSchema.integer.getURI() : XmlSchema.decimal.getURI();
            facetsMap[XmlSchema.maxExclusive.toNT()] = new ARTLiteral(this.description.facets.maxExclusive + "", dt).toNT();
        }
        if (this.description.facets.maxInclusive != null) {
            let dt: string = Number.isInteger(this.description.facets.minExclusive) ? XmlSchema.integer.getURI() : XmlSchema.decimal.getURI();
            facetsMap[XmlSchema.maxInclusive.toNT()] = new ARTLiteral(this.description.facets.maxInclusive + "", dt).toNT();
        }
        return this.datatypeService.setDatatypeRestriction(this.context.datatype, this.description.base, facetsMap);
    }

}