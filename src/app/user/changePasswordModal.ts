import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { AuthServices } from "../services/authServices";
import { UserServices } from "../services/userServices";
import { VBContext } from "../utils/VBContext";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "change-pwd-modal",
    templateUrl: "/changePasswordModal.html",
})
export class ChangePasswordModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private oldPwd: string;
    private newPwd: string;
    private newPwdConfirm: string;

    constructor(public dialog: DialogRef<BSModalContext>, private userService: UserServices, private authService: AuthServices, 
        private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    private isInputValid(): boolean {
        return (
            this.oldPwd != undefined && this.oldPwd.trim() != "" &&
            this.newPwd != undefined && this.newPwd.trim() != "" &&
            this.newPwdConfirm != undefined && this.newPwdConfirm.trim() != "" &&
            this.isNewPwdConfirmOk()
        );
    }

    private isNewPwdConfirmOk(): boolean {
        return this.newPwd == this.newPwdConfirm;
    }

    ok(event: Event) {
        this.userService.changePassword(VBContext.getLoggedUser().getEmail(), this.oldPwd, this.newPwd).subscribe(
            stResp => {
                this.basicModals.alert("Password changed", "Your password has been succesfully changed. Now you will be logged out.").then(
                    ok => {
                        this.authService.logout().subscribe(
                            stResp => {
                                this.dialog.close();
                            }
                        );
                        
                    }
                )
                
            }
        )
        
    }

    cancel() {
        this.dialog.dismiss();
    }

}