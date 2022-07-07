import { ChangeDetectorRef, Component, forwardRef, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AuthServiceMode } from "../models/Properties";
import { UserForm, UserFormCustomField, UserFormOptionalField } from "../models/User";
import { UserServices } from "../services/userServices";
import { VBContext } from "../utils/VBContext";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "user-create",
    templateUrl: "./userCreateComponent.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UserCreateComponent), multi: true,
    }]
})
export class UserCreateComponent implements ControlValueAccessor {

    @Input() constraint: UserConstraint;
    @Input() registration: boolean; // true if this component is used inside registration form

    authServMode: AuthServiceMode;

    iriInfoTitle = "This will be used as user identifier inside VocBench. You can specify a personal IRI";
    personalUrlVisible: boolean;

    form: UserForm = new UserForm();
    optionalFields: UserFormOptionalField[];
    customFields: UserFormCustomField[];

    showPwd: boolean = false;
    showPwdConf: boolean = false;

    constructor(private userService: UserServices, private sharedModals: SharedModalServices, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.authServMode = VBContext.getSystemSettings().authService;
        if (this.authServMode == AuthServiceMode.SAML && this.constraint) {
            this.form.email = this.constraint.email;
            this.form.givenName = this.constraint.givenName;
            this.form.familyName = this.constraint.familyName;
            //set a fake password since in SAML pwd is not necessary
            let fakePwd: string = Math.random()+"";
            this.form.password = fakePwd;
            this.form.confirmedPassword = fakePwd;
        }
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

    editLanguages() {
        this.sharedModals.selectLanguages({ key: "ACTIONS.SELECT_LANGUAGES" }, this.form.languageProficiencies).then(
            langs => {
                this.form.languageProficiencies = langs;
                this.onModelChange();
            },
            () => { }
        );
    }

    /**
     * Used also in template to dynamically set class to password input text
     */
    private isConfirmPwdOk() {
        return this.form.password == this.form.confirmedPassword;
    }


    onModelChange() {
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

export interface UserConstraint {
    email: string;
    givenName: string;
    familyName: string;
}