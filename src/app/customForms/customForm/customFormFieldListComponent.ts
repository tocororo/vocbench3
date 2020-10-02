import { Component, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AnnotationName, FormField, FormFieldAnnotation } from "../../models/CustomForms";

@Component({
    selector: "custom-form-field-list",
    templateUrl: "./customFormFieldListComponent.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomFormFieldList), multi: true,
    }],
})
export class CustomFormFieldList implements ControlValueAccessor {

    private field: FormField;

    private min: number;
    private max: number;

    private subFields: FormField[];

    constructor() { }

    private addValue() {
        this.subFields.push(this.field.clone());
    }

    private removeValue(index: number) {
        this.subFields.splice(index, 1);
        this.onModelChange();
    }

    private onFieldChange(index: number) {
        this.onModelChange();
    }

    onModelChange() {
        let fieldValue: string[] = [];
        this.subFields.forEach(f => {
            if (f.value != null && f.value.trim() != "") {
                fieldValue.push(<string>f.value);
            }
        })
        this.field.value = fieldValue;
        this.propagateChange(this.field);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: FormField) {
        if (obj) {
            this.field = obj;
            
            let annList: FormFieldAnnotation = this.field.getAnnotation(AnnotationName.Collection);
            this.min = annList.min;
            this.max = (annList.max != 0) ? annList.max : 99;
            this.subFields = [];
            if (this.min > 0) {
                for (let i = 0; i < annList.min; i++) {
                    this.subFields.push(this.field.clone());
                }
            } else { //min 0, default value if min is not specified in the annotation
                this.subFields.push(this.field.clone());
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