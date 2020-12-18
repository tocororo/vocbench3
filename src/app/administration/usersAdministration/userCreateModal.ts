import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../models/ARTResources";
import { UserForm } from "../../models/User";
import { UserServices } from "../../services/userServices";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

/**
 * Modal that allows to choose among a set of rdfResource
 */
@Component({
    selector: "user-create-modal",
    templateUrl: "./userCreateModal.html",
})
export class UserCreateModal {

    userForm: UserForm;

    constructor(public activeModal: NgbActiveModal, private userService: UserServices, private basicModals: BasicModalServices) { }

    ok() {
        //check all required parameter
        if (!this.userForm.email || 
            (!this.userForm.password || this.userForm.password.trim() == "") ||
            (!this.userForm.confirmedPassword || this.userForm.confirmedPassword.trim() == "") ||
            (!this.userForm.givenName || this.userForm.givenName.trim() == "") ||
            (!this.userForm.familyName || this.userForm.familyName.trim() == "")) {
            this.basicModals.alert({key:"STATUS.INVALID_DATA"}, "Please fill all the required fields", ModalType.warning);
            return;
        }
        if (this.userForm.urlAsIri && (this.userForm.url == null || this.userForm.url.trim() == "")) {
            this.basicModals.alert({key:"STATUS.INVALID_DATA"}, "You checked the option to use the personal URL as user IRI, but the URL is not provided." + 
                " Please enter a valid URL or uncheck the above option", ModalType.warning);
            return
        }
        //check email
        if (!UserForm.isValidEmail(this.userForm.email)) {
            this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, "Please enter a valid e-mail address", ModalType.warning);
            return;
        }
        //check password
        if (this.userForm.password != this.userForm.confirmedPassword) {
            this.basicModals.alert({key:"STATUS.INVALID_DATA"}, "Password and confirmed password are different.", ModalType.warning);
            return;
        }
        //check IRI
        if (this.userForm.urlAsIri && !UserForm.isIriValid(this.userForm.iri)) {
            this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, "Please enter a valid IRI.", ModalType.warning);
            return;
        }
        
        let userIri: ARTURIResource = null;
        if (this.userForm.iri != null) {
            userIri = new ARTURIResource(this.userForm.iri);
        }

        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.userService.registerUser(this.userForm.email, this.userForm.password, this.userForm.givenName, this.userForm.familyName, userIri,
            this.userForm.address, this.userForm.affiliation, this.userForm.url, this.userForm.avatarUrl, this.userForm.phone,
            this.userForm.languageProficiencies, this.userForm.customProperties).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, "User succesfully created");
                this.activeModal.close();
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}