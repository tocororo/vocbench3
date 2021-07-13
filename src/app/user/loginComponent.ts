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
    email: string;
    password: string;

    constructor(private router: Router, private authService: AuthServices, private userService: UserServices,
        private basicModals: BasicModalServices) { }

    onKeydown(event: KeyboardEvent) {
        if (event.key == "Enter") {
            this.login();
        }
    }

    login() {
        this.authService.login(this.email, this.password, this.rememberMe).subscribe(
            user => {
                if (VBContext.isLoggedIn()) {
                    this.loggedIn.emit();
                }
            }
            //wrong login is already handled in HttpManager#handleError 
        );
    }

    forgotPassword() {
        this.basicModals.prompt({key:"USER.PASSWORD.FORGOT_PASSWORD"}, { value: "E-mail" }, {key:"MESSAGES.PASSWORD_RESET_INSERT_EMAIL"}).then(
            (email: string) => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.userService.forgotPassword(email.trim()).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.basicModals.alert({key:"USER.PASSWORD.FORGOT_PASSWORD"}, {key:"MESSAGES.PASSWORD_RESET_INSTRUCTION_SENT"});
                    }
                );
            },
            () => {}
        );
    }

}