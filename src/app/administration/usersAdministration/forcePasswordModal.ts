import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { User } from "../../models/User";
import { AuthServices } from "../../services/authServices";
import { UserServices } from "../../services/userServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { VBContext } from "../../utils/VBContext";

export class ForcePasswordModalData extends BSModalContext {
    constructor(public user: User) {
        super();
    }
}

@Component({
    selector: "force-pwd-modal",
    templateUrl: "/forcePasswordModal.html",
})
export class ForcePasswordModal implements ModalComponent<ForcePasswordModalData> {
    context: ForcePasswordModalData;

    private password: string;

    constructor(public dialog: DialogRef<ForcePasswordModalData>, private userService: UserServices, private authService: AuthServices, 
        private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    private isInputValid(): boolean {
        return this.password != undefined && this.password.trim() != "";
    }

    ok(event: Event) {
        this.userService.forcePassword(this.context.user.getEmail(), this.password).subscribe(
            stResp => {
                this.basicModals.alert("Password changed", "Password of " + this.context.user.getShow() + " has been succesfully changed.").then(
                    () => {
                        this.dialog.close();
                    }
                );
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}