import { Component } from "@angular/core";
import { User, UserStatusEnum } from "../../models/User";
import { AdministrationServices } from "../../services/administrationServices";
import { AuthServices } from "../../services/authServices";
import { UserServices } from "../../services/userServices";
import { VBProperties } from "../../utils/VBProperties";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

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
        mailSmtpAuth: null
    };
    private pristineEmailConfig: EmailConfig;

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
                    mailSmtpAuth: conf.mailSmtpAuth
                }
                this.pristineEmailConfig = Object.assign({}, this.emailConfig);

                this.adminMail = conf.adminAddress;
                this.pristineAdminMail = conf.emailAdminAddress;
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

    
    private updateEmailConfig() {
        let mailFromPwd: string = null;
        if (this.emailConfig.mailSmtpAuth == "true") {
            mailFromPwd = this.emailConfig.mailFromPassword;
        }
        this.adminService.updateEmailConfig(this.emailConfig.mailSmtpHost, this.emailConfig.mailSmtpPort, this.emailConfig.mailSmtpAuth, 
            this.emailConfig.mailFromAddress, mailFromPwd, this.emailConfig.mailFromAlias).subscribe(
            stResp => {
                this.init();
            }
        )
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
    public mailSmtpAuth: string;
    public mailSmtpHost: string;
    public mailSmtpPort: string;
}