import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'datasize-renderer',
    templateUrl: './dataSizeRenderer.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DataSizeRenderer), multi: true,
    }]
})
export class DataSizeRenderer implements ControlValueAccessor {

    @Input() disabled: boolean = false;
    
    size: number;
    units: DataSizeUnits[] = [DataSizeUnits.B, DataSizeUnits.kB, DataSizeUnits.MB, DataSizeUnits.GB, DataSizeUnits.TB, 
        DataSizeUnits.KiB, DataSizeUnits.MiB, DataSizeUnits.GiB, DataSizeUnits.TiB];
    unit: DataSizeUnits = this.units[0];

    value: string;

    constructor() { }

    onModelChanged() {
        this.value = this.size + this.unit;
        this.propagateChange(this.value);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: string) {
        if (obj && obj.trim() != "") {
            this.value = obj;
            let regexp = "([0-9]*\\\.?[0-9]+)\\\s?(" + this.units.join("|") + ")"; //digits with optional . separator, followed by an optional space, then the unit
            let valueMatch: RegExpMatchArray = this.value.match(regexp);
            if (valueMatch != null) {
                this.size = Number(valueMatch[1]);
                this.unit = <DataSizeUnits>valueMatch[2];
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

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };

    //--------------------------------------------------

}

enum DataSizeUnits {
    B = "B",
    kB = "kB",
    MB = "MB",
    GB = "GB",
    TB = "TB",
    KiB = "KiB",
    MiB = "MiB",
    GiB = "GiB",
    TiB = "TiB",
}