import { Component, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UserForm } from "../models/User";
import { Countries } from "../models/LanguagesCountries";
import { UIUtils } from "../utils/UIUtils";

@Component({
    selector: "user-create",
    templateUrl: "./userCreateComponent.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UserCreateComponent), multi: true,
    }]
})
export class UserCreateComponent {

    private countries = Countries.countryList;
    private genders = ["Male", "Female", "Other"];
    private selectedGender: string;

    private iriInfoTitle = "This will be used as user identifier inside VocBench. You can specify a personal IRI, " + 
        "or in alternative, you can use the personal URL as IRI. If you leave it empty the system will provide a default IRI to your account";

    private form: UserForm = new UserForm();

    constructor() { }

    ngAfterViewInit() {
        setTimeout(() => {
            this.propagateChange(this.form);
        });
    }

    private onGenderChange() {
        if (this.selectedGender == "Other") {
            this.form.gender = null;
        } else {
            this.form.gender = this.selectedGender;
        }
        this.propagateChange(this.form);
    }

    private onUrlAsIriChange() {
        if (this.form.urlAsIri) {
            this.form.iri = this.form.url;
        }
        this.propagateChange(this.form);
    }

    private onUrlChange() {
        if (this.form.urlAsIri) {
            this.form.iri = this.form.url;
        }
        this.propagateChange(this.form);
    }

    /**
     * Used also in template to dynamically set class to password input text
     */
    private isConfirmPwdOk() {
        return this.form.password == this.form.confirmedPassword;
    }


    private onModelChange() {
        this.propagateChange(this.form);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: UserForm) {
        if (obj) {
            this.form = obj;
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