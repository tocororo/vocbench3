import { Component, EventEmitter, Output } from "@angular/core";
import { AuthServiceMode } from "../models/Properties";
import { User } from "../models/User";
import { AuthServices } from "../services/authServices";
import { UserServices } from "../services/userServices";
import { HttpManager } from "../utils/HttpManager";
import { UIUtils } from "../utils/UIUtils";
import { VBContext } from "../utils/VBContext";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "login",
    templateUrl: "./loginComponent.html",
})
export class LoginComponent {

    @Output() loggedIn: EventEmitter<User> = new EventEmitter();

    authServMode: AuthServiceMode;

    private rememberMe: boolean = false;
    email: string;
    password: string;

    samlAction: string;
    samlBtnLabel: string;

    constructor(private authService: AuthServices, private userService: UserServices,
        private basicModals: BasicModalServices) { }

    ngOnInit() {
        this.authServMode = VBContext.getSystemSettings().authService;
        if (this.authServMode == AuthServiceMode.SAML) {
            let serverhost = HttpManager.getServerHost();
            this.samlAction = serverhost + "/semanticturkey/it.uniroma2.art.semanticturkey/st-core-services/saml/login";
        }
        let saml_login_label: string = window['saml_login_label'];
        this.samlBtnLabel = saml_login_label ? saml_login_label : "SAML login";
    }

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