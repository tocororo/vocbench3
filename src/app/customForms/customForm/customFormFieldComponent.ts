import { Component, forwardRef, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ARTNode } from "../../models/ARTResources";
import { FormField } from "../../models/CustomForms";

@Component({
    selector: "custom-form-field",
    templateUrl: "./customFormFieldComponent.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomFormField), multi: true,
    }],
})
export class CustomFormField implements ControlValueAccessor {

    @Input() lang: string;

    field: FormField;

    constructor() { }

    private initLang() {
        //if an input language is provided and the field uses the coda:langString converter
        if (this.field.getConverter() == 'http://art.uniroma2.it/coda/contracts/langString' && this.lang != null) {
            let convArg = this.field.getConverterArg();
            /* 
            if the arguments of the converter is another placeholder (e.g. coda:langString($lang)) 
            and not directly provided/forced as string (e.g. in coda:langString('en')) 
            */
            if (convArg != null && this.field.getConverterArg().ph) {
                /* 
                the above conditions set visible the lang-picker, so set as default value of the ph argument the @input lang
                but first, check also if the language is not foreseen in case of @oneOfLang annotation restrictions
                */
                let oneOfLang: string[] = this.field['oneOfLang'];
                if (oneOfLang == null || oneOfLang.indexOf(this.lang) != -1) {
                    this.field.getConverterArg().ph.value = this.lang;
                }
            }
        }
    }

    /**
     * Listener to change of lang-picker used to set the language argument of a formField that
     * has coda:langString as converter
     */
    onConverterLangChange(newLang: string, formFieldConvArgumentPh: FormField) {
        /* setTimeout to trigger a new round of change detection avoid an exception due to changes in a lifecycle hook
        (see https://github.com/angular/angular/issues/6005#issuecomment-165911194) */
        window.setTimeout(() => {
            formFieldConvArgumentPh.value = newLang;
            this.propagateChange(this.field);
        });
    }

    /**
     * Listener on change of a formField input field. Checks if there are some other
     * formEntries with the same userPrompt and eventually updates their value
     */
    onEntryValueChange(value: string) {
        this.field.value = value;
        this.propagateChange(this.field);
    }

    updateNodeField(res: ARTNode) {
        if (res != null) {
            this.field.value = res.getNominalValue();
        } else {
            this.field.value = null;
        }
        this.propagateChange(this.field);
    }

    onModelChanged() {
        this.propagateChange(this.field);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: FormField) {
        if (obj) {
            this.field = obj;
            this.initLang();
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