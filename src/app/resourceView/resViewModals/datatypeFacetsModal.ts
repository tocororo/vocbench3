import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTBNode, ARTLiteral, ARTURIResource } from "../../models/ARTResources";
import { DatatypeRestrictionDescription, DatatypeUtils } from "../../models/Datatypes";
import { XmlSchema } from "../../models/Vocabulary";
import { DatatypesServices } from "../../services/datatypesServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

export class DataTypeFacetsModalData extends BSModalContext {
    constructor(
        public title: string,
        public datatype: ARTURIResource,
        public restriction: ARTBNode, //if provided, allow to edit
    ) {
        super();
    }
}

@Component({
    selector: "datatype-facets-modal",
    templateUrl: "./dataTypeFacetsModal.html",
})
export class DataTypeFacetsModal implements ModalComponent<DataTypeFacetsModalData> {
    context: DataTypeFacetsModalData;

    // private base: ARTURIResource;
    private base: ARTURIResource = XmlSchema.string;
    private pattern: string;
    private min: number;
    private max: number;

    private baseOpts: ARTURIResource[] = DatatypeUtils.xsdBuiltInTypes;
    private readonly EXCLUSIVE: string = "Exclusive";
    private readonly INCLUSIVE: string = "Inclusive";
    private inclusiveExclusive: string[] = [this.EXCLUSIVE, this.INCLUSIVE];
    private minIE: string = this.inclusiveExclusive[0];
    private maxIE: string = this.inclusiveExclusive[0];

    constructor(public dialog: DialogRef<DataTypeFacetsModalData>, private datatypeService: DatatypesServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.restriction != null) {
            this.datatypeService.getRestrictionDescription(this.context.restriction).subscribe(
                (description: DatatypeRestrictionDescription) => {
                    this.base = this.baseOpts.find(dt => dt.equals(description.base));
                    this.pattern = description.facets.pattern;
                    if (description.facets.minExclusive != null || description.facets.minInclusive != null) {
                        this.min = description.facets.minExclusive != null ? description.facets.minExclusive : description.facets.minInclusive;
                        this.minIE = description.facets.minExclusive != null ? this.EXCLUSIVE : this.INCLUSIVE;
                    }
                    if (description.facets.maxExclusive != null || description.facets.maxInclusive != null) {
                        this.max = description.facets.maxExclusive != null ? description.facets.maxExclusive : description.facets.maxInclusive;
                        this.maxIE = description.facets.maxExclusive != null ? this.EXCLUSIVE : this.INCLUSIVE;
                    }
                }
            );
        }
    }


    private isBaseNumeric(): boolean {
        return DatatypeUtils.xsdNumericDatatypes.some(dt => dt.equals(this.base));
    }

    ok(event: Event) {
        let minExclusive: number = null;
        let minInclusive: number = null;
        let maxExclusive: number = null;
        let maxInclusive: number = null;
        //check that at least one facet has been provided
        if (this.min == null && this.max == null && (this.pattern == null || this.pattern.trim() == "")) {
            this.basicModals.alert("Missing facets", "No facets has been provided. Please, fill at least one of the available facets", "warning");
            return;
        }
        //check that min and max are consistent (min lower than max)
        if (this.min != null && this.max != null && this.min >= this.max) {
            this.basicModals.alert("Invalid facets", "The minimun and maximum facets are inconsistent.", "warning");
            return;
        }
        //check that the given pattern is valid for a regex
        if (this.pattern != null) {
            try {
                new RegExp(this.pattern);
            } catch (e) {
                this.basicModals.alert("Invalid pattern", "The provided pattern is not valid", "warning");
                return;
            }
        }
        if (this.min != null) {
            if (this.minIE == this.INCLUSIVE) {
                minInclusive = this.min;
            } else {
                minExclusive = this.min;
            }
        }
        if (this.max != null) {
            if (this.maxIE == this.INCLUSIVE) {
                maxInclusive = this.max;
            } else {
                maxExclusive = this.max;
            }
        }

        let facetsMap: { [facet: string]: string } = {};
        if (this.pattern != null && this.pattern.trim() != "") {
            facetsMap[XmlSchema.pattern.toNT()] = new ARTLiteral(this.pattern + "").toNT();
        }
        if (minExclusive != null) {
            let dt: string = Number.isInteger(minExclusive) ? XmlSchema.integer.getURI() : XmlSchema.decimal.getURI();
            facetsMap[XmlSchema.minExclusive.toNT()] = new ARTLiteral(minExclusive + "", dt).toNT();
        }
        if (minInclusive != null) {
            let dt: string = Number.isInteger(minExclusive) ? XmlSchema.integer.getURI() : XmlSchema.decimal.getURI();
            facetsMap[XmlSchema.minInclusive.toNT()] = new ARTLiteral(minInclusive + "", dt).toNT();
        }
        if (maxExclusive != null) {
            let dt: string = Number.isInteger(minExclusive) ? XmlSchema.integer.getURI() : XmlSchema.decimal.getURI();
            facetsMap[XmlSchema.maxExclusive.toNT()] = new ARTLiteral(maxExclusive + "", dt).toNT();
        }
        if (maxInclusive != null) {
            let dt: string = Number.isInteger(minExclusive) ? XmlSchema.integer.getURI() : XmlSchema.decimal.getURI();
            facetsMap[XmlSchema.maxInclusive.toNT()] = new ARTLiteral(maxInclusive + "", dt).toNT();
        }
        this.datatypeService.setDatatypeRestriction(this.context.datatype, this.base, facetsMap).subscribe(
            () => {
                event.stopPropagation();
                event.preventDefault();
                this.dialog.close();
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}

export class DataTypeFacetsModalReturnData {
    base: ARTURIResource;
    pattern: string;
    minExclusive: number;
    minInclusive: number;
    maxExclusive: number;
    maxInclusive: number;
}
