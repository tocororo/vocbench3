import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { GraphForces } from '../model/ForceDirectedGraph';

@Component({
    selector: 'force-control-panel',
    templateUrl: "./forceControlPanel.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ForceControlPanel), multi: true,
    }]
})
export class ForceControlPanel implements ControlValueAccessor {

    forces: GraphForces;

    onForceChange() {
        this.propagateChange(this.forces);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: GraphForces) {
        if (obj) {
            this.forces = obj;
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