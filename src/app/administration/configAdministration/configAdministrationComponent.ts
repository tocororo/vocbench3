import { Component } from "@angular/core";
import { User, UserStatusEnum } from "../../models/User";
import { AdministrationServices } from "../../services/administrationServices";
import { AuthServices } from "../../services/authServices";
import { UserServices } from "../../services/userServices";
import { VBProperties } from "../../utils/VBProperties";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { UIUtils } from "../../utils/UIUtils";
import { VBContext } from "../../utils/VBContext";

@Component({
    selector: "config-admin-component",
    templateUrl: "./configAdministrationComponent.html",
    host: { class: "pageComponent" }
})
export class ConfigAdministrationComponent {

    private adminMail: string;
    private pristineAdminMail: string;

    private emailConfig: EmailConfig = {
        mailFromAddress: null,
        mailFromPassword: null,
        mailFromAlias: null,
        mailSmtpHost: null,
        mailSmtpPort: null,
        mailSmtpAuth: null,
        mailSmtpSslEnable: false,
        mailSmtpStarttlsEnable: false
    };
    private pristineEmailConfig: EmailConfig;

    private cryptoProtocol: string;

    private users: User[];

    private expFeatEnabled: boolean = false;

    constructor(private adminService: AdministrationServices, private userService: UserServices, private authService: AuthServices, 
        private vbProp: VBProperties, private basicModals: BasicModalServices) {}

    ngOnInit() {
        this.userService.listUsers().subscribe(
            users => {
                this.users = [];
                users.forEach((u: User) => {
                    if (u.getStatus() == UserStatusEnum.ACTIVE) {
                        this.users.push(u);
                    }
                });
            }
        )
        this.init();
    }

    private init() {
        this.adminService.getAdministrationConfig().subscribe(
            conf => {
                this.emailConfig = {
                    mailFromAddress: conf.mailFromAddress,
                    mailFromPassword: conf.mailFromPassword,
                    mailFromAlias: conf.mailFromAlias,
                    mailSmtpHost: conf.mailSmtpHost,
                    mailSmtpPort: conf.mailSmtpPort,
                    mailSmtpAuth: conf.mailSmtpAuth,
                    mailSmtpSslEnable: conf.mailSmtpSslEnable == "true",
                    mailSmtpStarttlsEnable: conf.mailSmtpStarttlsEnable == "true"
                }
                this.pristineEmailConfig = Object.assign({}, this.emailConfig);

                //init cryptoProtocol
                this.cryptoProtocol = "None";
                if (this.emailConfig.mailSmtpSslEnable) {
                    this.cryptoProtocol = "SSL";
                } else if (this.emailConfig.mailSmtpStarttlsEnable) {
                    this.cryptoProtocol = "TLS";
                }

                this.adminMail = conf.adminAddress;
                this.pristineAdminMail = conf.adminAddress;
            }
        );
        this.expFeatEnabled = this.vbProp.getExperimentalFeaturesEnabled();
    }

    private updateAdmin() {
        this.basicModals.confirm("Update configuration", "You are changing the administrator of Vocbench. " + 
            "If you confirm you'll be logged out. Are you sure to continue?", "warning").then(
            result => {
                this.adminService.updateAdministrator(this.adminMail).subscribe(
                    stResp => {
                        this.authService.logout().subscribe();
                    }
                );
            },
            () => {
                this.adminMail = this.pristineAdminMail;
            }
        );
    }

    private updateProtocol() {
        if (this.cryptoProtocol == "SSL") {
            this.emailConfig.mailSmtpSslEnable = true;
            this.emailConfig.mailSmtpStarttlsEnable = false;
        } else if (this.cryptoProtocol == "TLS") {
            this.emailConfig.mailSmtpSslEnable = false;
            this.emailConfig.mailSmtpStarttlsEnable = true;
        } else {
            this.emailConfig.mailSmtpSslEnable = false;
            this.emailConfig.mailSmtpStarttlsEnable = false;
        }
    }
    
    private updateEmailConfig() {
        let mailFromPwd: string = null;
        if (this.emailConfig.mailSmtpAuth) {
            mailFromPwd = this.emailConfig.mailFromPassword;
        }
        this.adminService.updateEmailConfig(this.emailConfig.mailSmtpHost, this.emailConfig.mailSmtpPort, this.emailConfig.mailSmtpAuth, 
            this.emailConfig.mailSmtpSslEnable, this.emailConfig.mailSmtpStarttlsEnable,
            this.emailConfig.mailFromAddress, this.emailConfig.mailFromAlias, mailFromPwd).subscribe(
            stResp => {
                this.init();
            }
        )
    }

    private testEmailConfig() {
        if (this.isEmailConfigChanged()) {
            this.basicModals.alert("Email configuration test", "Email configuration has been changed, you need first to submit the changes.", "warning");
            return;
        }

        this.basicModals.prompt("Email configuration test", { value: "Mail to" }, "This test will send an e-mail to the provided address in order to "
            + "check the e-mail configuration", VBContext.getLoggedUser().getEmail()).then(
            mailTo => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.adminService.testEmailConfig(mailTo).subscribe(
                    () => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.basicModals.alert("Email configuration test", "The configuration works fine. A test e-mail has been sent to " + mailTo + ".");
                    }
                );
            },
            () => {}
        );
    }

    private isAdminChanged(): boolean {
        return this.adminMail != this.pristineAdminMail;
    }

    private isEmailConfigChanged(): boolean {
        for (var key in this.pristineEmailConfig) {
            if (this.pristineEmailConfig[key] != this.emailConfig[key]) {
                return true;
            }
        }
        return false;
    }

    private onExpFeatEnabledChanged() {
        this.vbProp.setExperimentalFeaturesEnabled(this.expFeatEnabled);
    }

}

class EmailConfig {
    public mailFromAddress: string;
    public mailFromPassword: string;
    public mailFromAlias: string;
    public mailSmtpAuth: boolean;
    public mailSmtpSslEnable: boolean;
    public mailSmtpStarttlsEnable: boolean;
    public mailSmtpHost: string;
    public mailSmtpPort: string;
}