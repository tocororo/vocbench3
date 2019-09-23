import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { UserForm, UserFormField } from "../models/User";
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

    private iriInfoTitle = "This will be used as user identifier inside VocBench. You can specify a personal IRI, " + 
        "or in alternative, you can use the personal URL as IRI. If you leave it empty the system will provide a default IRI to your account";

    private form: UserForm = new UserForm();
    private customFields: UserFormField[];
    private customFieldsRowsIdx: number[];

    constructor(private userService: UserServices, private sharedModals: SharedModalServices) { }

    ngOnInit() {
        this.userService.getUserFormFields().subscribe(
            fields => {
                this.customFields = fields;
                this.customFieldsRowsIdx = [];
                for (let i = 0; i < Math.round(this.customFields.length/2); i++) {
                    this.customFieldsRowsIdx.push(i);
                }
            }
        );
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.onModelChange();
        });
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