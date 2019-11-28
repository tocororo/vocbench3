import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ARTURIResource } from "../../models/ARTResources";
import { DatatypeRestrictionDescription, DatatypeUtils } from "../../models/Datatypes";
import { XmlSchema } from "../../models/Vocabulary";

@Component({
    selector: "datatype-facets-editor",
    templateUrl: "./datatypeFacetsEditor.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatatypeFacetsEditor), multi: true,
    }]
})
export class DatatypeFacetsEditor {

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

    constructor() {}

    private isBaseNumeric(): boolean {
        return DatatypeUtils.xsdNumericDatatypes.some(dt => dt.equals(this.base));
    }

    onFacetsChange() {
        let description: DatatypeRestrictionDescription = new DatatypeRestrictionDescription();
        description.base = this.base;
        description.facets.pattern = this.pattern;
        if (this.isBaseNumeric()) {
            if (this.min != null) {
                if (this.minIE == this.INCLUSIVE) {
                    description.facets.minInclusive = this.min;
                } else {
                    description.facets.minExclusive = this.min;
                }
            }
            if (this.max != null) {
                if (this.maxIE == this.INCLUSIVE) {
                    description.facets.maxInclusive = this.max;
                } else {
                    description.facets.maxExclusive = this.max;
                }
            }
        }
        this.propagateChange(description);
    }


    //---- method of ControlValueAccessor ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: DatatypeRestrictionDescription) {
        if (obj != null) {
            this.base = this.baseOpts.find(dt => dt.equals(obj.base));
            this.pattern = obj.facets.pattern;
            if (obj.facets.minExclusive != null || obj.facets.minInclusive != null) {
                this.min = obj.facets.minExclusive != null ? obj.facets.minExclusive : obj.facets.minInclusive;
                this.minIE = obj.facets.minExclusive != null ? this.EXCLUSIVE : this.INCLUSIVE;
            }
            if (obj.facets.maxExclusive != null || obj.facets.maxInclusive != null) {
                this.max = obj.facets.maxExclusive != null ? obj.facets.maxExclusive : obj.facets.maxInclusive;
                this.maxIE = obj.facets.maxExclusive != null ? this.EXCLUSIVE : this.INCLUSIVE;
            }
        }
    }
    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    /**
     * Set the function to be called when the control receives a touch event. Not used.
     */
    registerOnTouched(fn: any): void { }

    //--------------------------------------------------

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };


}