import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthServices } from "../services/authServices";
import { UserServices } from "../services/userServices";
import { VBContext } from "../utils/VBContext";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "change-pwd-modal",
    templateUrl: "./changePasswordModal.html",
})
export class ChangePasswordModal {

    oldPwd: string;
    newPwd: string;
    newPwdConfirm: string;

    constructor(public activeModal: NgbActiveModal, private userService: UserServices, private authService: AuthServices, 
        private basicModals: BasicModalServices) {
    }

    isInputValid(): boolean {
        return (
            this.oldPwd != undefined && this.oldPwd.trim() != "" &&
            this.newPwd != undefined && this.newPwd.trim() != "" &&
            this.newPwdConfirm != undefined && this.newPwdConfirm.trim() != "" &&
            this.isNewPwdConfirmOk()
        );
    }

    isNewPwdConfirmOk(): boolean {
        return this.newPwd == this.newPwdConfirm;
    }

    ok() {
        this.userService.changePassword(VBContext.getLoggedUser().getEmail(), this.oldPwd, this.newPwd).subscribe(
            () => {
                this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, {key:"MESSAGES.PASSWORD_CHANGED_LOGGING_OUT"}).then(
                    () => {
                        this.authService.logout().subscribe(
                            () => {
                                this.activeModal.close();
                            }
                        );
                        
                    }
                )
                
            }
        )
        
    }

    cancel() {
        this.activeModal.dismiss();
    }

}