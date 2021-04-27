import { Component, Input, SimpleChanges } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SettingsServices } from "src/app/services/settingsServices";
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../models/ARTResources";
import { ConfigurationComponents } from "../../models/Configuration";
import { Language, Languages } from "../../models/LanguagesCountries";
import { ExtensionPointID, SettingsProp } from "../../models/Plugins";
import { Project } from "../../models/Project";
import { PartitionFilterPreference, Properties, ResourceViewPreference, SettingsEnum } from "../../models/Properties";
import { ProjectUserBinding, Role, User, UsersGroup } from "../../models/User";
import { AdministrationServices } from "../../services/administrationServices";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";
import { ProjectServices } from "../../services/projectServices";
import { UserServices } from "../../services/userServices";
import { UsersGroupsServices } from "../../services/usersGroupsServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../../utils/VBActions";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { LoadConfigurationModalReturnData } from "../../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { RoleDescriptionModal } from "../rolesAdministration/roleDescriptionModal";
import { UserProjBindingModal } from "./userProjBindingModal";

@Component({
    selector: "project-users-manager",
    templateUrl: "./projectUsersManagerComponent.html",
})
export class ProjectUsersManagerComponent {

    @Input() project: Project

    usersBound: User[]; //list of User bound to selected project 
    selectedUser: User; //user selected in the list of bound users

    private puBinding: ProjectUserBinding; //binding between selectedProject and selectedUser

    private roleList: Role[]; //all available roles for the selected project
    private selectedRole: Role; //role selected in roleList (available roles)
    private selectedUserRole: string; //selected role in the list of the roles assigned to selectedUser in the selectedProject

    private projectLanguages: Language[]; //all the languages assigned to the selected project
    private availableLanguages: Language[]; //the languages that are shown in the "Available languages" panel, those who is possible to assign to user
    //this might be a subset of projectLanguages (if filterProficiencies is active)
    private puLanguages: Language[]; //languages assigned to the user in the selected project
    private selectedLang: Language; //role selected in langList (available langs)
    private selectedUserLang: Language; //selected lang in the list of the language assigned to the selectedUser in the selectedProject
    private filterProficiencies: boolean = false;

    private groupList: UsersGroup[];
    private selectedGroup: UsersGroup;
    private selectedUserGroup: UsersGroup;

    private puTemplate: PartitionFilterPreference;

    constructor(private userService: UserServices, private projectService: ProjectServices, private adminService: AdministrationServices,
        private groupsService: UsersGroupsServices, private prefSettingsServices: PreferencesSettingsServices, private settingsService: SettingsServices,
        private vbProp: VBProperties, private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modalService: NgbModal) { }


    ngOnChanges(changes: SimpleChanges) {
        if (changes['project'] && changes['project'].currentValue) {
            this.userService.listUsersBoundToProject(this.project.getName()).subscribe(
                users => {
                    this.usersBound = users;
                    this.puBinding = null;
                    this.selectedUserRole = null;
                    this.selectedUserGroup = null;
                    /* look among the users bound to the project whether there is the currently selected user (if any).
                    In case, select it, otherwise reset the selected user */
                    if (this.selectedUser != null) {
                        let userFound: User = null;
                        for (let i = 0; i < this.usersBound.length; i++) {
                            if (this.selectedUser.getEmail() == this.usersBound[i].getEmail()) {
                                userFound = this.usersBound[i];
                                break;
                            }
                        }
                        if (userFound != null) {//selected user found among the users bound to project, select it
                            this.selectUser(userFound);
                        } else {//selected user not found among the users bound to project, reset it
                            this.selectedUser = null;
                        }
                    }
                }
            );
            this.adminService.listRoles(this.project).subscribe(
                roles => {
                    this.roleList = roles;
                }
            );
            this.groupsService.listGroups().subscribe(
                groups => {
                    this.groupList = groups;
                }
            );
            this.settingsService.getProjectSettings(ExtensionPointID.ST_CORE_ID, this.project).subscribe(
                settings => {
                    this.projectLanguages = settings.getPropertyValue(SettingsEnum.languages);
                    Languages.sortLanguages(this.projectLanguages);
                    this.initAvailableLanguages();
                }
            )
        }
    }

    /** ==========================
     * USERS PANEL
     * ========================== */

    private selectUser(user: User) {
        this.selectedUser = user;
        //init PUBinding
        this.adminService.getProjectUserBinding(this.project.getName(), this.selectedUser.getEmail()).subscribe(
            puBinding => {
                this.puBinding = puBinding;
                this.selectedUserRole = null;
                this.selectedUserLang = null;
                this.initAvailableLanguages();
                this.initPULanguages();
            }
        );
        /**
         * Init template; only if admin (required in order to allow to read/edit settings of other users)
         */
        if (this.isLoggedUserAdmin()) {
            this.settingsService.getPUSettingsOfUser(ExtensionPointID.ST_CORE_ID, this.project, this.selectedUser).subscribe(
                settings => {
                    let resViewSettings: ResourceViewPreference = settings.getPropertyValue(SettingsEnum.resourceView);
                    let partitionFilter: PartitionFilterPreference;
                    if (resViewSettings != null) {
                        partitionFilter = resViewSettings.resViewPartitionFilter;
                    }
                    this.puTemplate = partitionFilter;
                }
            )
        }
    }

    addUserToProject() {
        const modalRef: NgbModalRef = this.modalService.open(UserProjBindingModal, new ModalOptions());
        modalRef.componentInstance.project = this.project;
        modalRef.componentInstance.usersBound = this.usersBound;
        return modalRef.result.then(
            data => {
                let user: User = data.user;
                let roles: string[] = data.roles;
                this.adminService.addRolesToUser(this.project.getName(), user.getEmail(), roles).subscribe(
                    stResp => {
                        this.usersBound.push(user);
                    }
                )
            },
            () => { }
        );
    }

    removeUserFromProject() {
        this.basicModals.confirm({ key: "ADMINISTRATION.ACTIONS.REMOVE_USER" }, { key: "MESSAGES.REMOVE_USER_FROM_PROJ_CONFIRM", params: { user: this.selectedUser.getShow(), project: this.project.getName() } },
            ModalType.warning).then(
                () => {
                    this.adminService.removeUserFromProject(this.project.getName(), this.selectedUser.getEmail()).subscribe(
                        stResp => {
                            for (let i = 0; i < this.usersBound.length; i++) {
                                if (this.usersBound[i].getEmail() == this.selectedUser.getEmail()) {
                                    this.usersBound.splice(i, 1);
                                }
                            }
                            this.puBinding.setRoles([]);
                            this.selectedUser = null;
                            this.selectedRole = null;
                        }
                    );
                },
                () => { }
            );
    }

    /** ==========================
     * PROJECT-USER SETTINGS PANEL
     * ========================== */

    private cloneSettings() {
        this.projectService.listProjects().subscribe(
            projects => {
                this.basicModals.select({ key: "ACTIONS.DUPLICATE_SETTINGS" }, { key: "ACTIONS.SELECT_TARGET_PROJECT" }, projects.map(p => p.getName())).then(
                    targetProj => {
                        this.basicModals.confirm({ key: "ACTIONS.DUPLICATE_SETTINGS" }, { key: "MESSAGES.DUPLICATE_SETTINGS_TO_ANOTHER_PROJ_CONFIRM", params: { user: this.selectedUser.getShow(), project: targetProj } },
                            ModalType.warning).then(
                                () => {
                                    //clone binding-related settings (roles, group, language)
                                    let userIri: ARTURIResource = this.selectedUser.getIri();
                                    this.adminService.clonePUBinding(userIri, this.project.getName(), userIri, targetProj).subscribe(
                                        () => {
                                            this.basicModals.alert({ key: "ACTIONS.DUPLICATE_SETTINGS" }, { key: "MESSAGES.SETTINGS_DUPLICATED_SUCCESSFULLY" });
                                        }
                                    );
                                    //clone template
                                    this.updateTemplate(new Project(targetProj));
                                }
                            )
                    },
                    () => { }
                )
            }
        );
    }

    //=========== ROLES ===========

    private selectUserRole(role: string) {
        if (this.selectedUserRole == role) {
            this.selectedUserRole = null;
        } else {
            this.selectedUserRole = role;
        }
    }

    private selectRole(role: Role) {
        if (!this.isRoleAlreadyAssigned(role)) {
            if (this.selectedRole == role) {
                this.selectedRole = null;
            } else {
                this.selectedRole = role;
            }
        }
    }

    private addRole() {
        this.adminService.addRolesToUser(this.project.getName(), this.selectedUser.getEmail(), [this.selectedRole.getName()]).subscribe(
            stResp => {
                this.puBinding.addRole(this.selectedRole.getName());
                this.selectedRole = null;
            }
        );
    }

    private removeRole() {
        this.adminService.removeRoleFromUser(this.project.getName(), this.selectedUser.getEmail(), this.selectedUserRole).subscribe(
            stResp => {
                this.puBinding.removeRole(this.selectedUserRole);
                this.selectedUserRole = null;
            }
        );
    }

    /**
     * Return true if the given role is already assigned to the selectedUser in the selectedProject
     */
    private isRoleAlreadyAssigned(role: Role): boolean {
        if (this.puBinding == undefined) {
            return true;
        }
        let pubRoles: string[] = this.puBinding.getRoles();
        for (let i = 0; i < pubRoles.length; i++) {
            if (pubRoles[i] == role.getName()) {
                return true;
            }
        }
        return false;
    }

    showRoleDescription(role: Role) {
        const modalRef: NgbModalRef = this.modalService.open(RoleDescriptionModal, new ModalOptions());
        modalRef.componentInstance.role = role;
        modalRef.componentInstance.project = this.project;
    }

    //=========== GROUPS ===========

    private selectUserGroup(group: UsersGroup) {
        if (this.selectedUserGroup == group) {
            this.selectedUserGroup = null;
        } else {
            this.selectedUserGroup = group;
        }
    }

    private selectGroup(group: UsersGroup) {
        if (!this.isGroupAlreadyAssigned(group)) {
            if (this.selectedGroup == group) {
                this.selectedGroup = null;
            } else {
                this.selectedGroup = group;
            }
        }
    }

    private assignGroup() {
        this.groupsService.assignGroupToUser(this.project.getName(), this.selectedUser.getEmail(), this.selectedGroup.iri).subscribe(
            stResp => {
                this.puBinding.setGroup(this.selectedGroup);
                this.selectedGroup = null;
            }
        )
    }

    private removeGroup() {
        this.groupsService.removeGroupFromUser(this.project.getName(), this.selectedUser.getEmail()).subscribe(
            stResp => {
                this.puBinding.removeGroup();
                this.selectedUserGroup = null;
            }
        );
    }

    private changeGroupLimitations() {
        let limitations: boolean = !this.puBinding.isSubjectToGroupLimitations();
        this.groupsService.setGroupLimitationsToUser(this.project.getName(), this.selectedUser.getEmail(), this.puBinding.getGroup().iri, limitations).subscribe(
            stResp => {
                this.puBinding.setGroupLimitations(limitations);
            }
        );
    }

    private isGroupAlreadyAssigned(group: UsersGroup): boolean {
        if (this.puBinding != undefined) {
            let assignedGroup = this.puBinding.getGroup();
            if (assignedGroup != null) {
                return assignedGroup.iri.getURI() == group.iri.getURI();
            }
        }
        return false;
    }


    //=========== LANGUAGES ===========

    private toggleFilterProficencies() {
        this.filterProficiencies = !this.filterProficiencies;
        this.initAvailableLanguages();
    }

    private initAvailableLanguages() {
        this.availableLanguages = [];
        this.projectLanguages.forEach(l => {
            let availableLang: Language = { name: l.name, tag: l.tag, mandatory: l.mandatory };
            availableLang['proficiency'] = this.isProficiencyLang(l.tag);
            if (!this.filterProficiencies || availableLang['proficiency']) {
                this.availableLanguages.push(availableLang);
            }
        });
    }

    private initPULanguages() {
        this.puLanguages = [];
        this.puBinding.getLanguages().forEach(puLangTag => {
            let lang: Language = this.projectLanguages.find(l => l.tag.toLocaleLowerCase() == puLangTag.toLocaleLowerCase());
            if (lang != null) {
                let puLang: Language = { name: lang.name, tag: lang.tag, mandatory: lang.mandatory };
                puLang['proficiency'] = this.isProficiencyLang(lang.tag);
                this.puLanguages.push(puLang);
            }
        })
        Languages.sortLanguages(this.puLanguages);
    }

    private selectUserLang(lang: Language) {
        if (this.selectedUserLang == lang) {
            this.selectedUserLang = null;
        } else {
            this.selectedUserLang = lang;
        }
    }

    private selectLang(lang: Language) {
        if (!this.isLangAlreadyAssigned(lang)) {
            if (this.selectedLang == lang) {
                this.selectedLang = null;
            } else {
                this.selectedLang = lang;
            }
        }
    }

    private addLanguage() {
        this.puBinding.addLanguage(this.selectedLang.tag);
        this.updateLanguagesOfUserInProject();
    }

    private addAllLanguages() {
        let langs: string[] = [];
        this.projectLanguages.forEach(l => {
            langs.push(l.tag);
        });
        this.puBinding.setLanguages(langs);
        this.updateLanguagesOfUserInProject();
    }

    private addProficienciesLangs() {
        this.projectLanguages.forEach(l => {
            if (!this.isLangAlreadyAssigned(l) && this.isProficiencyLang(l.tag)) {
                this.puBinding.addLanguage(l.tag);
            }
        });
        this.updateLanguagesOfUserInProject();
    }

    private removeLanguage() {
        this.puBinding.removeLanguage(this.selectedUserLang.tag);
        this.updateLanguagesOfUserInProject();
    }

    private removeAllLanguages() {
        this.puBinding.setLanguages([]);
        this.updateLanguagesOfUserInProject();
    }

    private leaveProficienciesLangs() {
        let langs: string[] = [];
        this.puBinding.getLanguages().forEach(l => {
            if (this.isProficiencyLang(l)) {
                langs.push(l);
            }
        });
        this.puBinding.setLanguages(langs);
        this.updateLanguagesOfUserInProject();
    }

    private isProficiencyLang(lang: string): boolean {
        if (this.selectedUser != null) {
            return this.selectedUser.getLanguageProficiencies().some(l => l.toLocaleLowerCase() == lang.toLocaleLowerCase());
        } else {
            return false;
        }
    }

    private isLangAlreadyAssigned(lang: Language): boolean {
        if (this.puBinding == undefined) {
            return true;
        }
        let pubLanguages: string[] = this.puBinding.getLanguages();
        return pubLanguages.some(l => l.toLocaleLowerCase() == lang.tag.toLocaleLowerCase());
    }

    private updateLanguagesOfUserInProject() {
        this.adminService.updateLanguagesOfUserInProject(this.project.getName(), this.selectedUser.getEmail(), this.puBinding.getLanguages()).subscribe(
            () => {
                this.selectedUserLang = null;
                this.initPULanguages();
                //if the updates are applied to the current user in the current project, update project binding in context 
                if (
                    VBContext.getLoggedUser().getEmail() == this.selectedUser.getEmail() &&
                    VBContext.getWorkingProject() != null && VBContext.getWorkingProject().getName() == this.project.getName()
                ) {
                    VBContext.setProjectUserBinding(this.puBinding);
                }
            }
        );
    }

    //=========== TEMPLATES ===========

    private loadTemplate() {
        this.sharedModals.loadConfiguration({ key: "ACTIONS.LOAD_TEMPLATE" }, ConfigurationComponents.TEMPLATE_STORE).then(
            (conf: LoadConfigurationModalReturnData) => {
                let templateProp: SettingsProp = conf.configuration.properties.find(p => p.name == "template");
                if (templateProp != null) {
                    this.puTemplate = templateProp.value;
                    this.updateTemplate();
                }
            }
        )
    }

    private storeTemplate() {
        let config: { [key: string]: any } = {
            template: this.puTemplate
        }
        this.sharedModals.storeConfiguration({ key: "ACTIONS.SAVE_TEMPLATE" }, ConfigurationComponents.TEMPLATE_STORE, config);
    }

    private updateTemplate(project?: Project) {
        if (project == null) {
            project = this.project;
        }
        this.prefSettingsServices.setPUSettingOfUser(Properties.pref_res_view_partition_filter, this.selectedUser, JSON.stringify(this.puTemplate), project).subscribe(
            () => {
                //in case the setting has been changed for the logged user and the project currently accessed => update its cached PU-settings
                if (
                    VBContext.getWorkingProject() != null && VBContext.getWorkingProject().getName() == project.getName() && //current accessed project
                    VBContext.getLoggedUser().getEmail() == this.selectedUser.getEmail() //current logged user
                ) {
                    this.vbProp.refreshResourceViewPartitionFilter().subscribe();
                }
            }
        );
    }



    //AUTH

    private isLoggedUserAdmin(): boolean {
        let loggedUser = VBContext.getLoggedUser();
        return loggedUser != null && loggedUser.isAdmin();
    }

    private isSelectedUserAdmin(): boolean {
        if (this.selectedUser == null) {
            return false;
        } else {
            return this.selectedUser.isAdmin();
        }
    }

    private isRoleManagementAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationUserRoleManagement);
    }
    private isGroupManagementAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationUserGroupManagement);
    }

}