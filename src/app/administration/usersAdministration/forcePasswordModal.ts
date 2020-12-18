import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from "../../models/User";
import { AuthServices } from "../../services/authServices";
import { UserServices } from "../../services/userServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "force-pwd-modal",
    templateUrl: "./forcePasswordModal.html",
})
export class ForcePasswordModal {
    @Input() user: User;

    translationParam: { userShow: string };

    password: string;

    constructor(public activeModal: NgbActiveModal, private userService: UserServices, private authService: AuthServices, 
        private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        this.translationParam = { userShow: this.user.getShow() };
    }

    isInputValid(): boolean {
        return this.password != undefined && this.password.trim() != "";
    }

    ok() {
        this.userService.forcePassword(this.user.getEmail(), this.password).subscribe(
            stResp => {
                this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, "Password of " + this.user.getShow() + " has been succesfully changed.").then(
                    () => {
                        this.activeModal.close();
                    }
                );
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}