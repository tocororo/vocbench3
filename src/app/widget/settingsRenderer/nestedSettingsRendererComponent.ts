import { Component, forwardRef, Input, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Settings } from '../../models/Plugins';

@Component({
    selector: 'nested-settings-renderer',
    templateUrl: './nestedSettingsRendererComponent.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NestedSettingSetRendererComponent), multi: true,
    }]
})
export class NestedSettingSetRendererComponent implements ControlValueAccessor {

    @Input() schema: Settings;
    @Input() disabled: boolean = false;
    
    settings: Settings;

    displayedSettings: Settings;

    constructor() { }

    ngOnInit() {
        this.init();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!changes['schema'].isFirstChange()) {
            this.init();
        }
    }
   
    init() {
        if (this.settings) {
            this.displayedSettings = this.settings;
        } else {
            this.displayedSettings = this.schema.clone();
        }
    }

    updatePropertiesValue(value: Settings) {
        this.settings = value;
        this.onModelChanged();
    }

    private onModelChanged() {
        this.propagateChange(this.settings);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: Settings) {
        if (obj && !(obj instanceof Settings)) {
            this.settings = this.schema.clone();
            for (let prop of this.settings.properties) {
                let value = obj[prop.name];
                if (value != null) {
                    prop.value = value;
                }
            }
        } else {
            this.settings = obj;
        }

        this.displayedSettings = this.settings ? this.settings : this.schema.clone();
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