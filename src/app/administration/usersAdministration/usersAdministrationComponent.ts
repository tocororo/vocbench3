import { Component } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ConfigurationComponents } from "../../models/Configuration";
import { SettingsProp } from "../../models/Plugins";
import { PartitionFilterPreference, Properties } from "../../models/Properties";
import { User, UserStatusEnum } from "../../models/User";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";
import { UserServices } from "../../services/userServices";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { LoadConfigurationModalReturnData } from "../../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { UserCreateModal, UserCreateModalData } from "./userCreateModal";

@Component({
    selector: "users-admin-component",
    templateUrl: "./usersAdministrationComponent.html",
    host: { class: "pageComponent" },
    styles: [`
        .online { color: green; font-weight: bold; } 
        .inactive { color: red; font-weight: bold; }
        .offline { color: lightgray }
    `]
})
export class UsersAdministrationComponent {

    private users: User[];
    private selectedUser: User;

    private showActive: boolean = true;
    private showInactive: boolean = true;
    private showNew: boolean = true;

    private userDetailsAspect: string = "Details";
    private rvTemplateAspect: string = "Template";
    private aspectSelectors: string[] = [this.userDetailsAspect, this.rvTemplateAspect]
    private selectedAspectSelector: string = this.aspectSelectors[0];

    private userTemplate: PartitionFilterPreference;

    constructor(private userService: UserServices, private prefService: PreferencesSettingsServices, private vbProp: VBProperties,
        private sharedModals: SharedModalServices, private modal: Modal) { }

    ngOnInit() {
        this.initUserList();
    }


    /** ==========================
     * Users management
     * =========================== */

    private initUserList() {
        this.selectedUser = null;
        this.userService.listUsers().subscribe(
            users => {
                this.users = users;
            }
        );
    }

    private selectUser(user: User) {
        if (this.selectedUser != user) {
            this.selectedUser = user;
            this.initTemplate();
        }
    }

    private createUser() {
        var modalData = new UserCreateModalData("Create user");
        const builder = new BSModalContextBuilder<UserCreateModalData>(
            modalData, undefined, UserCreateModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('lg').keyboard(27).toJSON() };
        return this.modal.open(UserCreateModal, overlayConfig).result.then(
            res => {
                this.initUserList();
            },
            () => {}
        );
    }

    /**
     * Based on filters "enabled" "disabled" "new" tells whether the user should be visible.
     */
    private isUserVisible(user: User): boolean {
        let status = user.getStatus();
        return (
            (this.showActive && status == UserStatusEnum.ACTIVE) ||
            (this.showInactive && status == UserStatusEnum.INACTIVE) ||
            (this.showNew && status == UserStatusEnum.NEW)
        );
    }

    /** ============================
     * Templates management
     * ============================ */

    private initTemplate() {
        this.prefService.getPUSettingsUserDefault([Properties.pref_res_view_partition_filter], this.selectedUser.getEmail()).subscribe(
            prefs => {
                let value = prefs[Properties.pref_res_view_partition_filter];
                if (value != null) {
                    this.userTemplate = JSON.parse(value);
                }
            }
        )
    }

    private loadTemplate() {
        this.sharedModals.loadConfiguration("Load template", ConfigurationComponents.TEMPLATE_STORE).then(
            (conf: LoadConfigurationModalReturnData) => {
                let templateProp: SettingsProp = conf.configuration.properties.find(p => p.name == "template");
                if (templateProp != null) {
                    this.userTemplate = templateProp.value;
                    this.updateTemplate();
                }
            }
        )
    }

    private storeTemplate() {
        let config: { [key: string]: any } = {
            template: this.userTemplate
        }
        this.sharedModals.storeConfiguration("Store template", ConfigurationComponents.TEMPLATE_STORE, config);
    }

    private updateTemplate() {
        let prefValue = (Object.keys(this.userTemplate).length != 0) ? JSON.stringify(this.userTemplate) : null;
        this.prefService.setPUSettingUserDefault(Properties.pref_res_view_partition_filter, this.selectedUser.getEmail(), prefValue).subscribe(
            () => {
                //in case the setting has been changed for the logged user and a project is currently accessed => update its cached PU-settings
                if (VBContext.getWorkingProject() != null && VBContext.getLoggedUser().getEmail() == this.selectedUser.getEmail()) {
                    this.vbProp.refreshResourceViewPartitionFilter();
                }
            }
        );
    }

}