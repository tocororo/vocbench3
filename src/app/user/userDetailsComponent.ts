import { Component, forwardRef, Input } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from "../models/ARTResources";
import { User, UserFormCustomField, UserFormOptionalField } from "../models/User";
import { UserServices } from "../services/userServices";
import { VBContext } from "../utils/VBContext";
import { ModalOptions } from '../widget/modal/Modals';
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { ChangePasswordModal } from "./changePasswordModal";

@Component({
    selector: "user-details",
    templateUrl: "./userDetailsComponent.html",
    host: { class: "vbox" },
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UserDetailsComponent), multi: true,
    }],
})
export class UserDetailsComponent {

    @Input() readonly: boolean = false; //true if the component is inside the Profile page, so the info (about the current logged user) can be changed

    user: User;

    optionalFields: UserFormOptionalField[];
    customFields: UserFormCustomField[];

    constructor(private userService: UserServices, private sharedModals: SharedModalServices, private modalService: NgbModal) { }

    ngOnInit() {
        this.userService.getUserFormFields().subscribe(
            fields => {
                this.optionalFields = fields.optionalFields;
                this.customFields = fields.customFields;
            }
        );
    }

    /**
     * Mandatory
     */

    updateGivenName(newGivenName: string) {
        this.userService.updateUserGivenName(this.user.getEmail(), newGivenName).subscribe(
            user => {
                this.updateUser(user);
            }
        )
    }

    updateFamilyName(newFamilyName: string) {
        this.userService.updateUserFamilyName(this.user.getEmail(), newFamilyName).subscribe(
            user => {
                this.updateUser(user);
            }
        )
    }

    updateEmail(newEmail: string) {
        this.userService.updateUserEmail(this.user.getEmail(), newEmail).subscribe(
            user => {
                this.updateUser(user);
            }
        )
    }

    changePwd() {
        this.modalService.open(ChangePasswordModal, new ModalOptions())
    }

    /**
     * Optional
     */

    getOptionalFieldValue(field: UserFormOptionalField): string {
        if (field.iri == UserFormOptionalField.URL_IRI) {
            return this.user.getUrl();
        } else if (field.iri == UserFormOptionalField.ADDRESS_IRI) {
            return this.user.getAddress();
        } else if (field.iri == UserFormOptionalField.AFFILIATION_IRI) {
            return this.user.getAffiliation();
        } else if (field.iri == UserFormOptionalField.PHONE_IRI) {
            return this.user.getPhone();
        }
    }
    updateOptionalFieldValue(field: UserFormOptionalField, value: string) {
        if (field.iri == UserFormOptionalField.URL_IRI) {
            this.updateUrl(value);
        } else if (field.iri == UserFormOptionalField.ADDRESS_IRI) {
            this.updateAddress(value);
        } else if (field.iri == UserFormOptionalField.AFFILIATION_IRI) {
            this.updateAffiliation(value);
        } else if (field.iri == UserFormOptionalField.PHONE_IRI) {
            this.updatePhone(value);
        }
    }
    getOptionalFieldLabel(field: UserFormOptionalField): string {
        return UserFormOptionalField.getOptionalFieldLabel(field);
    }

    updatePhone(newPhone: string) {
        this.userService.updateUserPhone(this.user.getEmail(), newPhone).subscribe(
            user => {
                this.updateUser(user);
            }
        )
    }

    updateAddress(newAddress: string) {
        this.userService.updateUserAddress(this.user.getEmail(), newAddress).subscribe(
            user => {
                this.updateUser(user);
            }
        )
    }

    updateAffiliation(newAffiliation: string) {
        this.userService.updateUserAffiliation(this.user.getEmail(), newAffiliation).subscribe(
            user => {
                this.updateUser(user);
            }
        )
    }

    updateUrl(newUrl: string) {
        this.userService.updateUserUrl(this.user.getEmail(), newUrl).subscribe(
            user => {
                this.updateUser(user);
            }
        )
    }

    /**
     * Other
     */

    updateAvatarUrl(newUrl: string) {
        this.userService.updateUserAvatarUrl(this.user.getEmail(), newUrl).subscribe(
            user => {
                this.updateUser(user);
            }
        )
    }

    editLanguages() {
        this.sharedModals.selectLanguages({key:"ACTIONS.SELECT_LANGUAGES"}, this.user.getLanguageProficiencies()).then(
            langs => {
                this.userService.updateUserLanguageProficiencies(this.user.getEmail(), langs).subscribe(
                    user => {
                        this.updateUser(user);
                    }
                );
            },
            () => {}
        );
    }

    /**
     * Custom
     */

    updateCustomProperty(field: UserFormCustomField, value: string) {
        this.userService.updateUserCustomField(this.user.getEmail(), new ARTURIResource(field.iri), value).subscribe(
            user => {
                this.updateUser(user);
            }
        );
    }

    private updateUser(user: User) {
        this.user = user;
        VBContext.setLoggedUser(this.user);
        this.propagateChange(this.user);
    }


    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
     writeValue(obj: User) {
        if (obj) {
            this.user = obj;
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