import { Component } from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SettingsServices } from "src/app/services/settingsServices";
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { ConfigurationComponents } from "../../models/Configuration";
import { ExtensionPointID, SettingsProp } from "../../models/Plugins";
import { PartitionFilterPreference, ResourceViewPreference, SettingsEnum } from "../../models/Properties";
import { User, UserStatusEnum } from "../../models/User";
import { UserServices } from "../../services/userServices";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { LoadConfigurationModalReturnData } from "../../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { UserCreateModal } from "./userCreateModal";

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

    users: User[];
    selectedUser: User;

    showActive: boolean = true;
    showInactive: boolean = true;
    showNew: boolean = true;

    private userDetailsAspect: string = "Details";
    private rvTemplateAspect: string = "Template";
    private aspectSelectors: string[] = [this.userDetailsAspect, this.rvTemplateAspect]
    selectedAspectSelector: string = this.aspectSelectors[0];

    private userProjects: string[]; //project assigned to the user

    private userResViewPref: ResourceViewPreference;
    private userTemplate: PartitionFilterPreference;

    constructor(private userService: UserServices, private settingsService: SettingsServices,
        private vbProp: VBProperties, private sharedModals: SharedModalServices, private modalService: NgbModal) { }

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

    selectUser(user: User) {
        if (this.selectedUser != user) {
            this.selectedUser = user;
            this.initTemplate();
            //init project assigned to user user
            if (!this.selectedUser.isAdmin()) {
                this.userService.listProjectsBoundToUser(this.selectedUser.getIri()).subscribe(
                    projects => {
                        this.userProjects = projects;
                    }
                );
            }
        }
    }

    createUser() {
        this.modalService.open(UserCreateModal, new ModalOptions('lg')).result.then(
            res => {
                this.initUserList();
            },
            () => {}
        );
    }

    /**
     * Based on filters "enabled" "disabled" "new" tells whether the user should be visible.
     */
    isUserVisible(user: User): boolean {
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
        this.settingsService.getPUSettingsUserDefault(ExtensionPointID.ST_CORE_ID, this.selectedUser).subscribe(
            settings => {
                this.userResViewPref = settings.getPropertyValue(SettingsEnum.resourceView);
                if (this.userResViewPref == null) {
                    this.userResViewPref = new ResourceViewPreference();
                }
                this.userTemplate = this.userResViewPref.resViewPartitionFilter;
            }
        )
    }

    loadTemplate() {
        this.sharedModals.loadConfiguration({key:"ACTIONS.LOAD_TEMPLATE"}, ConfigurationComponents.TEMPLATE_STORE).then(
            (conf: LoadConfigurationModalReturnData) => {
                let templateProp: SettingsProp = conf.configuration.properties.find(p => p.name == "template");
                if (templateProp != null) {
                    this.userTemplate = templateProp.value;
                    this.updateTemplate();
                }
            }
        )
    }

    storeTemplate() {
        let config: { [key: string]: any } = {
            template: this.userTemplate
        }
        this.sharedModals.storeConfiguration({key:"ACTIONS.SAVE_TEMPLATE"}, ConfigurationComponents.TEMPLATE_STORE, config);
    }

    private updateTemplate() {
        this.userResViewPref.resViewPartitionFilter = this.userTemplate;
        this.settingsService.storePUSettingUserDefault(ExtensionPointID.ST_CORE_ID, this.selectedUser, SettingsEnum.resourceView, this.userResViewPref).subscribe(
            () => {
                //in case the setting has been changed for the logged user and a project is currently accessed => update its cached PU-settings
                if (VBContext.getWorkingProject() != null && VBContext.getLoggedUser().getEmail() == this.selectedUser.getEmail()) {
                    this.vbProp.refreshResourceViewPartitionFilter().subscribe();
                }
            }
        )
    }

}