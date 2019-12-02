import { Component, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ARTLiteral } from "../../models/ARTResources";

@Component({
    selector: "data-range-editor",
    templateUrl: "./dataRangeEditor.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DataRangeEditor), multi: true,
    }]
})
export class DataRangeEditor implements ControlValueAccessor {
    private datarange: ARTLiteral[] = [];

    private value: ARTLiteral;

    ngOnInit() {
        if (this.datarange === undefined) {
            this.datarange = [];
        }
    }

    private add() {
        for (var i = 0; i < this.datarange.length; i++) {
            if (this.datarange[i].getValue() == this.value.getValue() && this.datarange[i].getDatatype() == this.value.getDatatype()) {
                return; //datarange already in list => do not add
            }
        }
        this.datarange.push(this.value);
        this.propagateChange(this.datarange);
    }

    private remove(dr: ARTLiteral) {
        this.datarange.splice(this.datarange.indexOf(dr), 1);
        this.propagateChange(this.datarange);
    }



    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: ARTLiteral[]) {
        if (obj) {
            this.datarange = obj;
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