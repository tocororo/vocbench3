import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { UserServices } from "../services/userServices";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "verify-email-component",
    template: "<div></div>",
    host: { class: "pageComponent" }
})
export class VerifyEmailComponent {

    constructor(private userService: UserServices, private basicModals: BasicModalServices, 
        private activeRoute: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        let email: string = this.activeRoute.snapshot.queryParams['email'];
        let token: string = this.activeRoute.snapshot.queryParams['token'];
        if (token && email) {
            this.userService.verifyUserEmail(email, token).subscribe(
                () => {
                    this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, {key: "MESSAGES.USER_EMAIL_VERIFIED"});
                    this.router.navigate(["/Home"]);
                },
                (err: Error) => {
                    if (err.name.endsWith("EmailVerificationExpiredException")) {
                        this.basicModals.alert({key:"STATUS.ERROR"}, err.message);
                    }
                }
            )
        }
    }

}