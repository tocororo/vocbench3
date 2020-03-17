import { Component, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ARTNode } from "../../models/ARTResources";
import { FormField } from "../../models/CustomForms";

/**
 * Modal that allows to choose among a set of rdfResource
 */
@Component({
    selector: "custom-form-field",
    templateUrl: "./customFormFieldComponent.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomFormField), multi: true,
    }],
})
export class CustomFormField implements ControlValueAccessor {

    private field: FormField;

    constructor() { }


    /**
     * Listener to change of lang-picker used to set the language argument of a formField that
     * has coda:langString as converter
     */
    private onConverterLangChange(newLang: string, formFieldConvArgumentPh: FormField) {
        /* setTimeout to trigger a new round of change detection avoid an exception due to changes in a lifecycle hook
        (see https://github.com/angular/angular/issues/6005#issuecomment-165911194) */
        window.setTimeout(() => {
            formFieldConvArgumentPh.value = newLang
            this.propagateChange(this.field);
        });
    }

    /**
     * Listener on change of a formField input field. Checks if there are some other
     * formEntries with the same userPrompt and eventually updates their value
     */
    private onEntryValueChange(value: string) {
        this.field.value = value;
        this.propagateChange(this.field);
    }

    private updateNodeField(res: ARTNode) {
        if (res != null) {
            this.field.value = res.getNominalValue();
        } else {
            this.field.value = null;
        }
        this.propagateChange(this.field);
    }

    private onModelChanged() {
        this.propagateChange(this.field);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: FormField) {
        if (obj) {
            this.field = obj;
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