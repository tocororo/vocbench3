import { Component } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { UserServices } from "../../services/userServices";
import { UserForm } from "../../models/User";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { UIUtils } from "../../utils/UIUtils";

export class UserCreateModalData extends BSModalContext {
    /**
     * @param title title of the dialog
     */
    constructor(public title: string) {
        super();
    }
}

/**
 * Modal that allows to choose among a set of rdfResource
 */
@Component({
    selector: "user-create-modal",
    templateUrl: "./userCreateModal.html",
})
export class UserCreateModal implements ModalComponent<UserCreateModalData> {
    context: UserCreateModalData;

    private userForm: UserForm;

    constructor(public dialog: DialogRef<UserCreateModalData>, private userService: UserServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ok(event: Event) {
        //check all required parameter
        if (!this.userForm.email || 
            (!this.userForm.password || this.userForm.password.trim() == "") ||
            (!this.userForm.confirmedPassword || this.userForm.confirmedPassword.trim() == "") ||
            (!this.userForm.givenName || this.userForm.givenName.trim() == "") ||
            (!this.userForm.familyName || this.userForm.familyName.trim() == "")) {
            this.basicModals.alert("Invalid data", "Please fill all the required fields", "error");
            return;
        }
        //check email
        if (!UserForm.isValidEmail(this.userForm.email)) {
            this.basicModals.alert("Invalid data", "Please enter a valid e-mail address", "error");
            return;
        }
        //check password
        if (this.userForm.password != this.userForm.confirmedPassword) {
            this.basicModals.alert("Invalid data", "Password and confirmed password are different.", "error");
            return;
        }
        UIUtils.startLoadingDiv(document.getElementById("blockDivFullScreen"));
        this.userService.registerUser(this.userForm.email, this.userForm.password, this.userForm.givenName, this.userForm.familyName,
            this.userForm.birthday, this.userForm.gender, this.userForm.country, this.userForm.address, this.userForm.affiliation,
            this.userForm.url, this.userForm.phone).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivFullScreen"));
                this.basicModals.alert("User created", "User succesfully created");
                event.stopPropagation();
                this.dialog.close();
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}