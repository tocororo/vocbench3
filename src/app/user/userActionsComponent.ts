import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { UserServices } from "../services/userServices";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalType } from "../widget/modal/Modals";

@Component({
    selector: "user-actions-component",
    template: "<div></div>",
    host: { class: "pageComponent" }
})
export class UserActionsComponent {

    constructor(private userService: UserServices, private basicModals: BasicModalServices, 
        private activeRoute: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        let action = this.activeRoute.snapshot.queryParams['action'];
        let email: string = this.activeRoute.snapshot.queryParams['email'];
        let token: string = this.activeRoute.snapshot.queryParams['token'];
        if (action == "verify") {
            this.verifyEmail(email, token);
        } else if (action == "activate") {
            this.activateUser(email, token);
        }

        
    }

    private verifyEmail(email: string, token: string) {
        this.userService.verifyUserEmail(email, token).subscribe(
            () => {
                this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, {key: "MESSAGES.USER_EMAIL_VERIFIED"});
                this.router.navigate(["/Home"]);
            },
            (err: Error) => {
                if (err.name.endsWith("EmailVerificationExpiredException")) {
                    this.basicModals.alert({key:"STATUS.ERROR"}, err.message, ModalType.warning);
                }
            }
        )
    }

    private activateUser(email: string, token: string) {
        this.userService.activateRegisteredUser(email, token).subscribe(
            () => {
                this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, {key: "MESSAGES.USER_REGISTERED_ACTIVATED", params: {email: email}});
                this.router.navigate(["/Home"]);
            },
            (err: Error) => {
                if (err.name.endsWith("UserActivationExpiredException")) {
                    this.basicModals.alert({key:"STATUS.ERROR"}, err.message, ModalType.warning);
                }
            }
        )
    }

}