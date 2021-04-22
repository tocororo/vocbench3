import { Component } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Properties, SettingsEnum } from "src/app/models/Properties";
import { PreferencesSettingsServices } from "src/app/services/preferencesSettingsServices";
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../models/ARTResources";
import { ConfigurationComponents } from "../../models/Configuration";
import { CronDefinition } from "../../models/Notifications";
import { ExtensionPointID, Scope } from "../../models/Plugins";
import { UserForm, UserFormCustomField, UserFormOptionalField } from "../../models/User";
import { AdministrationServices } from "../../services/administrationServices";
import { NotificationServices } from "../../services/notificationServices";
import { SettingsServices } from "../../services/settingsServices";
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

    isInitialConfiguration: boolean; //tells if the component is shown in the initial system configuration (after 1st user registration)

    /* SemanticTurkeyData folder */
    stDataFolder: string;
    stDataFolderPristine: string;

    profilerThreshold: number;
    profilerThresholdPristine: number;


    /* E-mail configuration */

    emailConfig: EmailConfig = {
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

    cryptoProtocol: string;

    /* Notifications configuration */
    timezones: string[];
    timezone: string;
    private timezonePristine: string;
    hoursOfDay: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    cronHourOfDay: number;
    private cronHourOfDayPristine: number;

    /* Registration form fields */
    optionalFields: UserFormOptionalField[];

    customFormFields: UserFormCustomField[];
    private customFormFieldsPristine: UserFormCustomField[];
    selectedCustomField: UserFormCustomField;
    fieldsIdx: number[] = [0, 1, 2, 3];
    translationParam: { maxFields: number } = { maxFields: this.fieldsIdx.length };

    /* Home content */
    homeContent: string;
    private homeContentPristine: string;
    safeHomeContent: SafeHtml;

    /* Project creation */
    defaultAclUniversalAccess: boolean;
    defaultOpenAtStartup: boolean;

    /* Experimental features */
    expFeatEnabled: boolean = false;


    constructor(private adminService: AdministrationServices, private userService: UserServices, private vbProp: VBProperties, 
        private settingsService: SettingsServices, private notificationsService: NotificationServices, private prefService: PreferencesSettingsServices,
        private basicModals: BasicModalServices, private translateService: TranslateService, public sanitizer: DomSanitizer, private router: Router) { }

    ngOnInit() {
        this.isInitialConfiguration = this.router.url == "/Sysconfig";

        this.initAdminConfig();
        this.initNotificationsConfig();
        this.initFields();
        this.initHomeContent();
        this.initProjCreation();
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
                    mailSmtpAuth: conf.mailSmtpAuth == "true",
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

    updateDataFolder() {
        this.adminService.setDataDir(this.stDataFolder).subscribe(
            () => {
                this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, {key:"MESSAGES.ST_DATA_FOLDER_UPDATED"});
                this.stDataFolderPristine = this.stDataFolder;
            }
        );
    }

    updateProfilerThreshold() {
        this.adminService.setPreloadProfilerThreshold(this.profilerThreshold).subscribe(
            () => {
                this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, {key:"MESSAGES.PRELOAD_PROFILER_THRESHOLD_UPDATED"});
                this.profilerThresholdPristine = this.profilerThreshold;
            }
        )
    }

    /* ============================
     * E-mail managment
     * ============================ */

    updateProtocol() {
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

    updateEmailConfig() {
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

    testEmailConfig() {
        if (this.isEmailConfigChanged()) {
            this.basicModals.alert({key: "ADMINISTRATION.SYSTEM.EMAIL.EMAIL_CONFIG_TEST"}, {key:"MESSAGES.EMAIL_CONFIG_CHANGED_SUBMIT_FIRST"}, ModalType.warning);
            return;
        }

        this.basicModals.prompt({key: "ADMINISTRATION.SYSTEM.EMAIL.EMAIL_CONFIG_TEST"}, { value: "Mail to" }, {key:"MESSAGES.EMAIL_CONFIG_TEST_DESCR"},
            VBContext.getLoggedUser().getEmail()).then(
            mailTo => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.adminService.testEmailConfig(mailTo).subscribe(
                    () => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.basicModals.alert({key: "ADMINISTRATION.SYSTEM.EMAIL.EMAIL_CONFIG_TEST"}, {key:"MESSAGES.EMAIL_CONFIG_WORKS_FINE"});
                    }
                );
            },
            () => { }
        );
    }

    isEmailConfigChanged(): boolean {
        for (var key in this.pristineEmailConfig) {
            if (this.pristineEmailConfig[key] != this.emailConfig[key]) {
                return true;
            }
        }
        return false;
    }

    /* ============================
     * Notifications
     * ============================ */

    private initNotificationsConfig() {
        if (this.timezones == null) { //so it is not initalized when refreshing configuration
            this.notificationsService.getAvailableTimeZoneIds().subscribe(
                timezoneIds => {
                    this.timezones = timezoneIds;
                }
            );
        }
        this.settingsService.getSettings(ConfigurationComponents.NOTIFICATION_SYSTEM_SETTINGS_MANAGER, Scope.SYSTEM).subscribe(
            settings => {
                //restore empty configuration
                this.cronHourOfDay = null;
                this.cronHourOfDayPristine = this.cronHourOfDay;
                this.timezone = null;
                this.timezonePristine = this.timezone;
                //parse the setting
                let cronDefinition: CronDefinition = settings.getPropertyValue("notificationDigestSchedule");
                if (cronDefinition == null) {
                    cronDefinition = {
                        expression: null,
                        zone: null
                    }
                }
                //convert the cron expression into hour of the day
                if (cronDefinition.expression != null) {
                    this.cronHourOfDay = parseInt(cronDefinition.expression.split(" ")[2]);
                    this.cronHourOfDayPristine = this.cronHourOfDay;
                }
                this.timezone = cronDefinition.zone;
                this.timezonePristine = this.timezone;

                // this.cronExprTest = cronDefinition.expression; //uncomment for test
            }
        )
    }

    updateNotificationSchedule() {
        let cronDefinition: CronDefinition = {
            expression: "0 0 " + this.cronHourOfDay + " * * *",
            zone: this.timezone
        }
        this.notificationsService.scheduleNotificationDigest(cronDefinition).subscribe(
            () => {
                this.initNotificationsConfig();
            }
        );
    }
    /**
     * Just for testing purpose (see also the related section in template)
     */
    // private cronExprTest: string;
    // private testNotificationSchedule() {
    //     let cronDefinition: CronDefinition = {
    //         expression: this.cronExprTest,
    //         zone: this.timezone
    //     }
    //     this.notificationsService.scheduleNotificationDigest(cronDefinition).subscribe(
    //         () => {
    //             this.initNotificationsConfig();
    //         }
    //     );
    // }

    disableNotificationSchedule() {
        this.notificationsService.scheduleNotificationDigest().subscribe(
            () => {
                this.initNotificationsConfig();
            }
        );
    }

    detectTimezone() {
        let localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (this.timezones.some(t => t == localTimezone)) {
            this.timezone = localTimezone;
        }
    }

    private isCronDefinitionChanged(): boolean {
        return this.cronHourOfDay != this.cronHourOfDayPristine || this.timezone != this.timezonePristine;
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


    renameCustomField(index: number, newValue: string) {
        let oldField = this.customFormFields[index];
        let duplicatedCustomField: boolean = this.customFormFields.some(f => f.label.toLocaleLowerCase() == newValue.toLocaleLowerCase());
        let duplicatedStandardField: boolean = UserForm.standardFields.some(f => f.toLocaleLowerCase() == newValue.toLocaleLowerCase());
        if (duplicatedCustomField || duplicatedStandardField) {
            let message = this.translateService.instant("MESSAGES.REGISTRATION_FORM_FIELD_ALREADY_DEFINED.FIELD_ALREADY_DEFINED", {fieldName: newValue});
            if (duplicatedStandardField) {
                message += " " + this.translateService.instant("MESSAGES.REGISTRATION_FORM_FIELD_ALREADY_DEFINED.IN_STANDARD_FORM");
            }
            this.basicModals.alert({key:"STATUS.WARNING"}, message, ModalType.warning).then(
                () => { //restore the old value
                    //temporary replace the .label at the edited index, so that the ngOnChanges will be fired in the input-edit component
                    this.customFormFields[index] = { iri: null, label: "" };
                    this.initFields();
                }
            );
        } else {
            if (oldField != null) {
                this.userService.updateUserFormCustomField(new ARTURIResource(oldField.iri), newValue).subscribe(
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

    updateCustomFieldDescr(index: number, description: string) {
        let field = this.customFormFields[index];
        this.userService.updateUserFormCustomField(new ARTURIResource(field.iri), field.label, description).subscribe(
            () => {
                this.initFields();
            }
        );
    }


    private selectCustomField(idx: number) {
        if (idx < this.customFormFields.length) {
            if (this.customFormFields[idx] == this.selectedCustomField) {
                this.selectedCustomField = null; //deselect
            } else {
                this.selectedCustomField = this.customFormFields[idx];
            }
        }
    }
    removeCustomField() {
        this.userService.removeUserFormCustomField(new ARTURIResource(this.selectedCustomField.iri)).subscribe(
            () => {
                this.initFields();
                this.selectedCustomField = null;
            }
        );
    }
    moveCustomField(direction: "UP" | "DOWN") {
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

    previewHomeContent() {
        this.safeHomeContent = this.sanitizer.bypassSecurityTrustHtml(this.homeContent);
    }

    updateHomeContent() {
        if (this.homeContent.trim() == "") {
            this.homeContent = null;
        }
        this.vbProp.setHomeContent(this.homeContent);
        this.homeContentPristine = this.homeContent;
    }

    isHomeContentChanged(): boolean {
        return this.homeContent != this.homeContentPristine;
    }

    /* ============================
     * project creation
     * ============================ */

    private initProjCreation() {
        this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM).subscribe(
            settings => {
                let projCreationSettings: any = settings.getPropertyValue(SettingsEnum.projectCreation);
                this.defaultAclUniversalAccess = projCreationSettings.aclUniversalAccessDefault;
                this.defaultOpenAtStartup = projCreationSettings.openAtStartUpDefault;
            }
        );
    }

    onDefaultAclChanged() {
        this.prefService.setSystemSetting(Properties.setting_proj_creation_default_acl_set_universal_access, this.defaultAclUniversalAccess+"").subscribe();
    }

    onDefaultOpenAtStartupChanged() {
        this.prefService.setSystemSetting(Properties.setting_proj_creation_default_open_at_startup, this.defaultOpenAtStartup+"").subscribe();
    }

    /* ============================
     * Experimental feature managment
     * ============================ */

    onExpFeatEnabledChanged() {
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