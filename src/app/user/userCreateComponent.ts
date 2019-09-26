import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { UserForm, UserFormCustomField, UserFormOptionalField } from "../models/User";
import { UserServices } from "../services/userServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "user-create",
    templateUrl: "./userCreateComponent.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UserCreateComponent), multi: true,
    }]
})
export class UserCreateComponent {

    private iriInfoTitle = "This will be used as user identifier inside VocBench. You can specify a personal IRI";
    private personalUrlVisible: boolean;

    private form: UserForm = new UserForm();
    private optionalFields: UserFormOptionalField[];
    private customFields: UserFormCustomField[];

    constructor(private userService: UserServices, private sharedModals: SharedModalServices) { }

    ngOnInit() {
        this.userService.getUserFormFields().subscribe(
            fields => {
                this.optionalFields = fields.optionalFields;
                this.personalUrlVisible = this.optionalFields.find(f => f.iri == UserFormOptionalField.URL_IRI).visible;
                if (this.personalUrlVisible) { //if personal URL is visible
                    this.iriInfoTitle += ", or in alternative, you can use the personal URL as IRI";
                }
                this.iriInfoTitle += ". If you leave it empty the system will provide a default IRI to your account";

                this.customFields = fields.customFields;
            }
        );
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.onModelChange();
        });
    }

    private getOptionalFieldLabel(field: UserFormOptionalField): string {
        return UserFormOptionalField.getOptionalFieldLabel(field);
    }
    private onOptionalFieldChange(field: UserFormOptionalField) {
        if (field.iri == UserFormOptionalField.ADDRESS_IRI) {
            this.form.address = field['value'];
        } else if (field.iri == UserFormOptionalField.AFFILIATION_IRI) {
            this.form.affiliation = field['value'];
        } else if (field.iri == UserFormOptionalField.PHONE_IRI) {
            this.form.phone = field['value'];
        } else if (field.iri == UserFormOptionalField.URL_IRI) {
            this.form.url = field['value'];
            if (this.form.urlAsIri) {
                this.form.iri = this.form.url;
            }
            
        }
        this.onModelChange();
    }

    private onUrlAsIriChange() {
        if (this.form.urlAsIri) {
            this.form.iri = this.form.url;
        }
        this.onModelChange();
    }

    private onUrlChange() {
        if (this.form.urlAsIri) {
            this.form.iri = this.form.url;
        }
        this.onModelChange();
    }

    private editLanguages() {
        this.sharedModals.selectLanguages("Language proficiencies", this.form.languageProficiencies).then(
            langs => {
                this.form.languageProficiencies = langs;
                this.onModelChange();
            },
            () => {}
        );
    }

    /**
     * Used also in template to dynamically set class to password input text
     */
    private isConfirmPwdOk() {
        return this.form.password == this.form.confirmedPassword;
    }


    private onModelChange() {
        for (let key in this.form) {
            if (this.form[key] == "") {
                this.form[key] = undefined;
            }
        }
        // console.log("propagate", this.form);
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