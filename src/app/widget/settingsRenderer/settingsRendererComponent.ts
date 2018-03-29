import { Component, Input, forwardRef } from '@angular/core';
import { Settings } from '../../models/Plugins';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'settings-renderer',
    templateUrl: './settingsRendererComponent.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SettingsRendererComponent), multi: true,
    }]
})
export class SettingsRendererComponent {
    
    private settings: Settings;

    constructor() { }

    private onModelChanged() {
        this.propagateChange(this.settings);
    }


    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: Settings) {
        if (obj) {
            this.settings = obj;
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