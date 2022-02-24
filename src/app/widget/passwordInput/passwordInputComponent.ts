import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'password-input',
    templateUrl: './passwordInputComponent.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PasswordInputComponent), multi: true,
    }]
})
export class PasswordInputComponent implements OnInit {

    @Input() size: string;
    @Input() placeholder: string = "";
    @Input() btnClass: string;
    @Input() readonly: boolean = false;
    @Input() invalid: boolean = false;


    private value: string;
    show: boolean = false;
    inputClass: string;

    constructor() { }

    ngOnInit() {
        this.inputClass = "input-group";
        if (this.size == "sm" || this.size == "lg") {
            this.inputClass += " input-group-" + this.size;
        }

        if (this.btnClass == null) {
            this.btnClass = "btn btn-light";
        }
    }


    onModelChanged() {
        this.propagateChange(this.value);
    }


    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: string) {
        if (obj) {
            this.value = obj;
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
    /**
     * the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
     * we use it to emit changes back to the parent
     */
    private propagateChange = (_: any) => { };

    //--------------------------------------------------

}
