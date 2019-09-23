import { Component } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from "../models/ARTResources";
import { User, UserFormField } from "../models/User";
import { UserServices } from "../services/userServices";
import { VBContext } from "../utils/VBContext";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { ChangePasswordModal } from "./changePasswordModal";

@Component({
    selector: "user-profile-component",
    templateUrl: "./userProfileComponent.html",
    host: { class: "pageComponent" }
})
export class UserProfileComponent {

    private user: User;
    private customFields: UserFormField[];
    private customFieldsRowsIdx: number[];

    constructor(private userService: UserServices, private sharedModals: SharedModalServices, private modal: Modal) { }

    ngOnInit() {
        this.initUser();
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

    initUser() {
        this.user = VBContext.getLoggedUser();
    }

    private updateGivenName(newGivenName: string) {
        this.userService.updateUserGivenName(this.user.getEmail(), newGivenName).subscribe(
            user => {
                VBContext.setLoggedUser(user);
                this.initUser();
            }
        )
    }

    private updateFamilyName(newFamilyName: string) {
        this.userService.updateUserFamilyName(this.user.getEmail(), newFamilyName).subscribe(
            user => {
                VBContext.setLoggedUser(user);
                this.initUser();
            }
        )
    }

    private updateEmail(newEmail: string) {
        this.userService.updateUserEmail(this.user.getEmail(), newEmail).subscribe(
            user => {
                VBContext.setLoggedUser(user);
                this.initUser();
            }
        )
    }

    private updatePhone(newPhone: string) {
        this.userService.updateUserPhone(this.user.getEmail(), newPhone).subscribe(
            user => {
                VBContext.setLoggedUser(user);
                this.initUser();
            }
        )
    }

    private updateAddress(newAddress: string) {
        this.userService.updateUserAddress(this.user.getEmail(), newAddress).subscribe(
            user => {
                VBContext.setLoggedUser(user);
                this.initUser();
            }
        )
    }

    private updateAffiliation(newAffiliation: string) {
        this.userService.updateUserAffiliation(this.user.getEmail(), newAffiliation).subscribe(
            user => {
                VBContext.setLoggedUser(user);
                this.initUser();
            }
        )
    }

    private updateUrl(newUrl: string) {
        this.userService.updateUserUrl(this.user.getEmail(), newUrl).subscribe(
            user => {
                VBContext.setLoggedUser(user);
                this.initUser();
            }
        )
    }

    private updateAvatarUrl(newUrl: string) {
        this.userService.updateUserAvatarUrl(this.user.getEmail(), newUrl).subscribe(
            user => {
                VBContext.setLoggedUser(user);
                this.initUser();
            }
        )
    }

    private editLanguages() {
        this.sharedModals.selectLanguages("Language proficiencies", this.user.getLanguageProficiencies()).then(
            langs => {
                this.userService.updateUserLanguageProficiencies(this.user.getEmail(), langs).subscribe(
                    user => {
                        VBContext.setLoggedUser(user);
                        this.initUser();
                    }
                );
            },
            () => {}
        );
    }

    private updateCustomProperty(fieldIri: string, value: string) {
        this.userService.updateUserCustomField(this.user.getEmail(), new ARTURIResource(fieldIri), value).subscribe(
            user => {
                VBContext.setLoggedUser(user);
                this.initUser();
            }
        );
    }

    private changePwd() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(ChangePasswordModal, overlayConfig);
    }


}