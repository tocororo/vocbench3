import { Component, Input } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from "../models/ARTResources";
import { User, UserFormCustomField, UserFormOptionalField } from "../models/User";
import { UserServices } from "../services/userServices";
import { VBContext } from "../utils/VBContext";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { ChangePasswordModal } from "./changePasswordModal";

@Component({
    selector: "user-details",
    templateUrl: "./userDetailsComponent.html",
    host: { class: "vbox" }
})
export class UserDetailsComponent {

    @Input() readonly: boolean = false; //true if the component is inside the Profile page, so the info (about the current logged user) can be changed
    @Input() user: User;

    private optionalFields: UserFormOptionalField[];
    private customFields: UserFormCustomField[];

    constructor(private userService: UserServices, private sharedModals: SharedModalServices, private modal: Modal) { }

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

    private updateGivenName(newGivenName: string) {
        this.userService.updateUserGivenName(this.user.getEmail(), newGivenName).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }

    private updateFamilyName(newFamilyName: string) {
        this.userService.updateUserFamilyName(this.user.getEmail(), newFamilyName).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }

    private updateEmail(newEmail: string) {
        this.userService.updateUserEmail(this.user.getEmail(), newEmail).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }

    private changePwd() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(ChangePasswordModal, overlayConfig);
    }

    /**
     * Optional
     */

    private getOptionalFieldValue(field: UserFormOptionalField): string {
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
    private updateOptionalFieldValue(field: UserFormOptionalField, value: string) {
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
    private getOptionalFieldLabel(field: UserFormOptionalField): string {
        return UserFormOptionalField.getOptionalFieldLabel(field);
    }

    private updatePhone(newPhone: string) {
        this.userService.updateUserPhone(this.user.getEmail(), newPhone).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }

    private updateAddress(newAddress: string) {
        this.userService.updateUserAddress(this.user.getEmail(), newAddress).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }

    private updateAffiliation(newAffiliation: string) {
        this.userService.updateUserAffiliation(this.user.getEmail(), newAffiliation).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }

    private updateUrl(newUrl: string) {
        this.userService.updateUserUrl(this.user.getEmail(), newUrl).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }

    /**
     * Other
     */

    private updateAvatarUrl(newUrl: string) {
        this.userService.updateUserAvatarUrl(this.user.getEmail(), newUrl).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        )
    }

    private editLanguages() {
        this.sharedModals.selectLanguages("Language proficiencies", this.user.getLanguageProficiencies()).then(
            langs => {
                this.userService.updateUserLanguageProficiencies(this.user.getEmail(), langs).subscribe(
                    user => {
                        VBContext.setLoggedUser(user);
                    }
                );
            },
            () => {}
        );
    }

    /**
     * Custom
     */

    private updateCustomProperty(field: UserFormCustomField, value: string) {
        this.userService.updateUserCustomField(this.user.getEmail(), new ARTURIResource(field.iri), value).subscribe(
            user => {
                VBContext.setLoggedUser(user);
            }
        );
    }

    
}