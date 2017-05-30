import { Component, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { AuthServices } from "../services/authServices";
import { UserServices } from "../services/userServices";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { VBContext } from "../utils/VBContext";
import { UIUtils } from "../utils/UIUtils";
import { User } from "../models/User";

@Component({
    selector: "login",
    templateUrl: "./loginComponent.html",
})
export class LoginComponent {

    @Output() loggedIn: EventEmitter<User> = new EventEmitter();

    private rememberMe: boolean = false;
    private email: string = "admin@vocbench.com";
    private password: string = "admin";

    constructor(private router: Router, private authService: AuthServices, private userService: UserServices,
        private basicModals: BasicModalServices) { }

    ngOnInit() {
        this.userService.getUser().subscribe(
            user => {
                if (user) {
                    VBContext.setLoggedUser(user);
                }
            }
        )
    }

    private onKeydown(event: KeyboardEvent) {
        if (event.which == 13) {
            this.login();
        }
    }

    private login() {
        this.authService.login(this.email, this.password, this.rememberMe).subscribe(
            user => {
                if (VBContext.isLoggedIn()) {
                    this.loggedIn.emit();
                }
            }
            //wrong login is already handled in HttpManager#handleError 
        );
    }

    private forgotPassword() {
        this.basicModals.prompt("Forgot password", "E-mail", "Insert the e-mail address of your account. " + 
            "You will receive an e-mail with the instructions for resetting the password").then(
            email => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.userService.forgotPassword(email).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.basicModals.alert("Forgot password", 
                            "An e-mail with the instructions for resetting password has been sent to the provided address.");
                    }
                );
            },
            () => {}
        );
    }

}