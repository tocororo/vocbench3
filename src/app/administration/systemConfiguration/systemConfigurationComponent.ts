import { Component } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { ARTURIResource } from "../../models/ARTResources";
import { UserForm, UserFormCustomField, UserFormOptionalField } from "../../models/User";
import { AdministrationServices } from "../../services/administrationServices";
import { UserServices } from "../../services/userServices";
import { UIUtils } from "../../utils/UIUtils";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "sys-config-component",
    templateUrl: "./systemConfigurationComponent.html",
    host: { class: "pageComponent" }
})
export class SystemConfigurationComponent {

    private isInitialConfiguration: boolean; //tells if the component is shown in the initial system configuration (after 1st user registration)

    /* SemanticTurkeyData folder */
    private stDataFolder: string;
    private stDataFolderPristine: string;

    private profilerThreshold: number;
    private profilerThresholdPristine: number;


    /* E-mail configuration */

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


    /* Registration form fields */
    private optionalFields: UserFormOptionalField[];

    private customFormFields: UserFormCustomField[];
    private customFormFieldsPristine: UserFormCustomField[];
    private selectedCustomField: UserFormCustomField;
    private fieldsIdx: number[] = [0, 1, 2, 3];

    /* Home content */
    private homeContent: string;
    private homeContentPristine: string;
    private safeHomeContent: SafeHtml;

    /* Experimental features */
    private expFeatEnabled: boolean = false;


    constructor(private adminService: AdministrationServices, private userService: UserServices, private vbProp: VBProperties,
        private basicModals: BasicModalServices, public sanitizer: DomSanitizer, private router: Router) { }

    ngOnInit() {
        this.isInitialConfiguration = this.router.url == "/Sysconfig";

        this.initAdminConfig();
        this.initFields();
        this.initHomeContent();
    }

    private initAdminConfig() {
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

                this.stDataFolder = conf.stDataDir;
                this.stDataFolderPristine = conf.stDataDir;

                this.profilerThreshold = conf.preloadProfilerTreshold;
                this.profilerThresholdPristine = conf.preloadProfilerTreshold;
            }
        );
        this.expFeatEnabled = VBContext.getSystemSettings().experimentalFeaturesEnabled;
    }

    /* ============================
     * Misc settings management (STData directory, profiler threshold...)
     * ============================ */

    private updateDataFolder() {
        this.adminService.setDataDir(this.stDataFolder).subscribe(
            () => {
                this.basicModals.alert("Update configuration", "SemanticTurkey data folder updated");
                this.stDataFolderPristine = this.stDataFolder;
            }
        );
    }

    private updateProfilerThreshold() {
        this.adminService.setPreloadProfilerThreshold(this.profilerThreshold).subscribe(
            () => {
                this.basicModals.alert("Update configuration", "Preload profiler threshold updated");
                this.profilerThresholdPristine = this.profilerThreshold;
            }
        )
    }

    /* ============================
     * E-mail managment
     * ============================ */

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
                    this.initAdminConfig();
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
                () => { }
            );
    }

    private isEmailConfigChanged(): boolean {
        for (var key in this.pristineEmailConfig) {
            if (this.pristineEmailConfig[key] != this.emailConfig[key]) {
                return true;
            }
        }
        return false;
    }


    /* ============================
     * Registration form fields
     * ============================ */

    private initFields() {
        this.userService.getUserFormFields().subscribe(
            fields => {
                this.optionalFields = fields.optionalFields;
                this.customFormFields = fields.customFields;
                this.customFormFieldsPristine = Object.assign({}, this.customFormFields);
                if (this.selectedCustomField != null) {
                    this.selectedCustomField = this.customFormFields.find(f => f.iri == this.selectedCustomField.iri);
                }
            }
        )
    }

    private getOptionalFieldLabel(field: UserFormOptionalField): string {
        return UserFormOptionalField.getOptionalFieldLabel(field);
    }

    private updateOptionalFieldVisibility(field: UserFormOptionalField) {
        field.visible = !field.visible;
        this.userService.updateUserFormOptionalFieldVisibility(new ARTURIResource(field.iri), field.visible).subscribe(
            () => {
                this.initFields();
            }
        )
    }


    private updateCustomField(index: number, newValue: string) {
        let oldField = this.customFormFields[index];
        let duplicatedCustomField: boolean = this.customFormFields.some(f => f.label.toLocaleLowerCase() == newValue.toLocaleLowerCase());
        let duplicatedStandardField: boolean = UserForm.standardFields.some(f => f.toLocaleLowerCase() == newValue.toLocaleLowerCase());
        if (duplicatedCustomField || duplicatedStandardField) {
            let message = "Field '" + newValue + "' already defined";
            if (duplicatedStandardField) {
                message += "in the standard registration form";
            }
            this.basicModals.alert("Duplicated field", message, "warning").then(
                () => { //restore the old value
                    //temporary replace the .label at the edited index, so that the ngOnChanges will be fired in the input-edit component
                    this.customFormFields[index] = { iri: null, label: "" };
                    this.initFields();
                }
            );
        } else {
            if (oldField != null) {
                this.userService.renameUserFormCustomField(new ARTURIResource(oldField.iri), newValue).subscribe(
                    () => {
                        this.initFields();
                    }
                );
            } else {
                this.userService.addUserFormCustomField(newValue).subscribe(
                    () => {
                        this.initFields();
                        this.selectedCustomField = null;
                    }
                );
            }
        }
    }


    private selectCustomField(idx: number) {
        if (idx < this.customFormFields.length) {
            this.selectedCustomField = this.customFormFields[idx];
        }
    }
    private removeCustomField() {
        this.userService.removeUserFormCustomField(new ARTURIResource(this.selectedCustomField.iri)).subscribe(
            () => {
                this.initFields();
                this.selectedCustomField = null;
            }
        );
    }
    private moveCustomField(direction: "UP" | "DOWN") {
        let idx = this.customFormFields.indexOf(this.selectedCustomField);
        let fieldIri1: ARTURIResource = new ARTURIResource(this.selectedCustomField.iri);
        let fieldIri2: ARTURIResource;
        if (direction == "UP" && idx > 0) {
            fieldIri2 = new ARTURIResource(this.customFormFields[idx - 1].iri);
            this.swapCustomFields(fieldIri1, fieldIri2);
        } else if (direction == "DOWN" && idx < this.customFormFields.length - 1) {
            fieldIri2 = new ARTURIResource(this.customFormFields[idx + 1].iri);
            this.swapCustomFields(fieldIri1, fieldIri2);
        }
    }
    private swapCustomFields(field1: ARTURIResource, field2: ARTURIResource) {
        this.userService.swapUserFormCustomFields(field1, field2).subscribe(
            () => {
                this.initFields();
            }
        );
    }

    /* ============================
     * Home content
     * ============================ */

    private initHomeContent() {
        this.homeContent = VBContext.getSystemSettings().homeContent;
        this.homeContentPristine = this.homeContent;
        if (this.homeContent != null) {
            this.previewHomeContent();
        }
    }

    private previewHomeContent() {
        this.safeHomeContent = this.sanitizer.bypassSecurityTrustHtml(this.homeContent);
    }

    private updateHomeContent() {
        if (this.homeContent.trim() == "") {
            this.homeContent = null;
        }
        this.vbProp.setHomeContent(this.homeContent);
        this.homeContentPristine = this.homeContent;
    }

    private isHomeContentChanged(): boolean {
        return this.homeContent != this.homeContentPristine;
    }

    /* ============================
     * Experimental feature managment
     * ============================ */

    private onExpFeatEnabledChanged() {
        this.vbProp.setExperimentalFeaturesEnabled(this.expFeatEnabled);
    }



    ok() {
        this.router.navigate(['/Projects']);
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