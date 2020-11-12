import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { UserServices } from "../services/userServices";
import { UIUtils } from "../utils/UIUtils";

@Component({
    selector: "reset-password-component",
    templateUrl: "./resetPasswordComponent.html",
    host: { class: "pageComponent" }
})
export class ResetPasswordComponent {

    email: string;
    private token: string;

    constructor(private userService: UserServices, private basicModals: BasicModalServices,
        private router: Router, private activeRoute: ActivatedRoute) { }

    ngOnInit() {
        this.token = this.activeRoute.snapshot.params['token'];
    }

    isEmailValid(): boolean {
        return (this.email != null && this.email.trim() != "");
    }

    reset() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.userService.resetPassword(this.email, this.token).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.basicModals.alert("Reset password", "Password has been successfully reset. "
                    + "You will receive an e-mail with the new temporary password.").then(
                    confirm => {
                        this.router.navigate(["/Home"]);
                    }
                )
            }
        )
    }

}