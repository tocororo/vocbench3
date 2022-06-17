import { Component, Input, SimpleChanges, ViewChild } from "@angular/core";
import { NgbDropdown, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SettingsServices } from "src/app/services/settingsServices";
import { ModalOptions, ModalType, TranslationUtils } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../models/ARTResources";
import { ConfigurationComponents } from "../../models/Configuration";
import { Language, Languages } from "../../models/LanguagesCountries";
import { ExtensionPointID, Scope, SettingsProp } from "../../models/Plugins";
import { Project } from "../../models/Project";
import { PartitionFilterPreference, ResourceViewPreference, SettingsEnum } from "../../models/Properties";
import { ProjectUserBinding, Role, User, UserFilter, UsersGroup } from "../../models/User";
import { AdministrationServices } from "../../services/administrationServices";
import { UserServices } from "../../services/userServices";
import { UsersGroupsServices } from "../../services/usersGroupsServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../../utils/VBActions";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { LoadConfigurationModalReturnData } from "../../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { GroupSelectorModal } from '../groupsAdministration/groupSelectorModal';
import { RoleDescriptionModal } from "../rolesAdministration/roleDescriptionModal";
import { RoleSelectorModal } from '../rolesAdministration/roleSelectorModal';
import { UserProjBindingModal } from "./userProjBindingModal";

@Component({
    selector: "project-users-manager",
    templateUrl: "./projectUsersManagerComponent.html",
    styles: [`
        .filter-dropdown > .dropdown-menu {
            min-width: 450px;
        }
    `]
})
export class ProjectUsersManagerComponent {

    @Input() project: Project;
    @ViewChild('filterDropdown') filterDropdown: NgbDropdown;

    usersBound: User[]; //list of User bound to selected project 
    selectedUser: User; //user selected in the list of bound users

    usersFilters: UserFilters = {
        languages: { filters: [], and: false },
        groups: { filters: [] },
        roles: { filters: [], and: false }
    };
    filteredUser: User[];

    private puBinding: ProjectUserBinding; //binding between selectedProject and selectedUser

    private roleList: Role[]; //all available roles for the selected project
    private selectedRole: Role; //role selected in roleList (available roles)
    private selectedUserRole: string; //selected role in the list of the roles assigned to selectedUser in the selectedProject

    private projectLanguages: Language[]; //all the languages assigned to the selected project
    private availableLanguages: Language[]; //the languages that are shown in the "Available languages" panel, those who is possible to assign to user
    //this might be a subset of projectLanguages (if filterProficiencies is active)
    private puLanguages: Language[]; //languages assigned to the user in the selected project
    selectedLangs: Language[]; //languages selected in available lang list (availableLanguages)
    selectedUserLangs: Language[]; //selected langs in the list of the languages assigned to the selectedUser in the selectedProject
    private filterProficiencies: boolean = false;

    private groupList: UsersGroup[];
    private selectedGroup: UsersGroup;
    private selectedUserGroup: UsersGroup;

    private resViewPref: ResourceViewPreference;
    private puTemplate: PartitionFilterPreference;

    constructor(private userService: UserServices, private adminService: AdministrationServices, private groupsService: UsersGroupsServices,
        private settingsService: SettingsServices, private vbProp: VBProperties,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modalService: NgbModal, private translate: TranslateService
    ) { }


    ngOnChanges(changes: SimpleChanges) {
        if (changes['project'] && changes['project'].currentValue) {
            this.userService.listUsersBoundToProject(this.project).subscribe(
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
                        if (userFound != null) { //selected user found among the users bound to project, select it
                            this.selectUser(userFound);
                        } else { //selected user not found among the users bound to project, reset it
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
            this.settingsService.getSettingsForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, this.project).subscribe(
                settings => {
                    this.projectLanguages = settings.getPropertyValue(SettingsEnum.languages);
                    Languages.sortLanguages(this.projectLanguages);
                    this.initAvailableLanguages();
                }
            );
            if (this.filterDropdown) {
                this.filterDropdown.close();
            }
            this.filteredUser = null;
            this.resetUsersFilters();
        }
    }

    /** ==========================
     * USERS PANEL
     * ========================== */

    private selectUser(user: User) {
        this.selectedUser = user;
        //init PUBinding
        this.adminService.getProjectUserBinding(this.project, this.selectedUser.getEmail()).subscribe(
            puBinding => {
                this.puBinding = puBinding;
                this.selectedUserRole = null;
                this.selectedUserLangs = [];
                this.initAvailableLanguages();
                this.initPULanguages();
            }
        );
        /**
         * Init template; only if admin (required in order to allow to read/edit settings of other users)
         */
        if (this.isLoggedUserAdmin()) {
            this.settingsService.getSettingsForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, this.project, this.selectedUser).subscribe(
                settings => {
                    this.resViewPref = settings.getPropertyValue(SettingsEnum.resourceView);
                    let partitionFilter: PartitionFilterPreference;
                    if (this.resViewPref != null) {
                        partitionFilter = this.resViewPref.resViewPartitionFilter;
                    }
                    this.puTemplate = partitionFilter;
                }
            );
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
                this.adminService.addRolesToUser(this.project, user.getEmail(), roles).subscribe(
                    stResp => {
                        this.usersBound.push(user);
                    }
                );
            },
            () => { }
        );
    }

    removeUserFromProject() {
        this.basicModals.confirm({ key: "ADMINISTRATION.ACTIONS.REMOVE_USER" }, { key: "MESSAGES.REMOVE_USER_FROM_PROJ_CONFIRM", params: { user: this.selectedUser.getShow(), project: this.project.getName(true) } },
            ModalType.warning).then(
                () => {
                    this.adminService.removeUserFromProject(this.project, this.selectedUser.getEmail()).subscribe(
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

    /*
    Filters
    */

    isUserVisible(user: User) {
        return this.filteredUser == null || this.filteredUser.some(u => u.getIri().equals(user.getIri()));
    }

    editUsersFilterLanguages() {
        this.sharedModals.selectLanguages({ key: "ACTIONS.SELECT_LANGUAGES" }, this.usersFilters.languages.filters, false).then(
            (langs: string[]) => {
                this.usersFilters.languages.filters = langs;
            },
            () => { }
        );
    }

    editUsersFilterRoles() {
        const modalRef: NgbModalRef = this.modalService.open(RoleSelectorModal, new ModalOptions('sm'));
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText({ key: "ACTIONS.SELECT_ROLES" }, this.translate);
        modalRef.componentInstance.project = this.project;
        modalRef.componentInstance.roles = this.usersFilters.roles.filters;
        modalRef.componentInstance.multiselection = true;
        modalRef.result.then(
            (roles: Role[]) => {
                this.usersFilters.roles.filters = roles;
                this.usersFilters.roles.preview = this.usersFilters.roles.filters.map(r => r.getName()).join(", ");
            },
            () => { }
        );
    }

    editUsersFilterGroups() {
        const modalRef: NgbModalRef = this.modalService.open(GroupSelectorModal, new ModalOptions('sm'));
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText({ key: "ACTIONS.SELECT_GROUPS" }, this.translate);
        modalRef.componentInstance.roles = this.usersFilters.groups.filters;
        modalRef.componentInstance.multiselection = true;
        modalRef.result.then(
            (groups: UsersGroup[]) => {
                this.usersFilters.groups.filters = groups;
                this.usersFilters.groups.preview = this.usersFilters.groups.filters.map(g => g.shortName).join(", ");
            },
            () => { }
        );
    }


    resetUsersFilters() {
        this.usersFilters.languages.filters = [];
        this.usersFilters.groups = {
            filters: [],
            preview: ""
        };
        this.usersFilters.roles = {
            filters: [],
            preview: ""
        };
    }

    filterUsers() {
        let roleFilter: UserFilter;
        if (this.usersFilters.roles.filters.length > 0) {
            roleFilter = {
                filters: this.usersFilters.roles.filters.map(r => r.getName()),
                and: this.usersFilters.roles.and
            };
        }
        let groupFilter: UserFilter;
        if (this.usersFilters.groups.filters.length > 0) {
            groupFilter = {
                filters: this.usersFilters.groups.filters.map(g => g.shortName),
            };
        }
        let langsFilter: UserFilter;
        if (this.usersFilters.languages.filters.length > 0) {
            langsFilter = {
                filters: this.usersFilters.languages.filters,
                and: this.usersFilters.languages.and
            };
        }
        this.userService.listUsersBoundToProject(this.project, roleFilter, groupFilter, langsFilter).subscribe(
            filterdUsers => {
                this.filteredUser = filterdUsers;
            }
        );
    }

    /** ==========================
     * PROJECT-USER SETTINGS PANEL
     * ========================== */

    cloneSettings() {
        this.basicModals.selectProject({ key: "ACTIONS.DUPLICATE_SETTINGS" }, { key: "ACTIONS.SELECT_TARGET_PROJECT" }).then(
            (targetProj: Project) => {
                this.basicModals.confirm({ key: "ACTIONS.DUPLICATE_SETTINGS" }, {
                    key: "MESSAGES.DUPLICATE_SETTINGS_TO_ANOTHER_PROJ_CONFIRM",
                    params: { user: this.selectedUser.getShow(), project: targetProj.getName(true) }
                },
                    ModalType.warning).then(
                        () => {
                            //clone binding-related settings (roles, group, language)
                            let userIri: ARTURIResource = this.selectedUser.getIri();
                            this.adminService.clonePUBinding(userIri, this.project, userIri, targetProj).subscribe(
                                () => {
                                    this.basicModals.alert({ key: "ACTIONS.DUPLICATE_SETTINGS" }, { key: "MESSAGES.SETTINGS_DUPLICATED_SUCCESSFULLY" });
                                }
                            );
                            //clone template
                            this.updateTemplate(targetProj);
                        }
                    );
            },
            () => { }
        );
    }

    //=========== ROLES ===========

    selectUserRole(role: string) {
        if (this.selectedUserRole == role) {
            this.selectedUserRole = null;
        } else {
            this.selectedUserRole = role;
        }
    }

    selectRole(role: Role) {
        if (!this.isRoleAlreadyAssigned(role)) {
            if (this.selectedRole == role) {
                this.selectedRole = null;
            } else {
                this.selectedRole = role;
            }
        }
    }

    addRole() {
        this.adminService.addRolesToUser(this.project, this.selectedUser.getEmail(), [this.selectedRole.getName()]).subscribe(
            stResp => {
                this.puBinding.addRole(this.selectedRole.getName());
                this.selectedRole = null;
            }
        );
    }

    removeRole() {
        this.adminService.removeRoleFromUser(this.project, this.selectedUser.getEmail(), this.selectedUserRole).subscribe(
            () => {
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


    showUserRoleDescription(roleName: string) {
        let role = this.roleList.find(r => r.getName() == roleName);
        if (role != null) {
            this.showRoleDescription(role);
        }
    }

    showRoleDescription(role: Role) {
        const modalRef: NgbModalRef = this.modalService.open(RoleDescriptionModal, new ModalOptions());
        modalRef.componentInstance.role = role;
        modalRef.componentInstance.project = this.project;
    }

    //=========== GROUPS ===========

    selectUserGroup(group: UsersGroup) {
        if (this.selectedUserGroup == group) {
            this.selectedUserGroup = null;
        } else {
            this.selectedUserGroup = group;
        }
    }

    selectGroup(group: UsersGroup) {
        if (!this.isGroupAlreadyAssigned(group)) {
            if (this.selectedGroup == group) {
                this.selectedGroup = null;
            } else {
                this.selectedGroup = group;
            }
        }
    }

    assignGroup() {
        this.groupsService.assignGroupToUser(this.project, this.selectedUser.getEmail(), this.selectedGroup.iri).subscribe(
            stResp => {
                this.puBinding.setGroup(this.selectedGroup);
                this.selectedGroup = null;
            }
        );
    }

    removeGroup() {
        this.groupsService.removeGroupFromUser(this.project, this.selectedUser.getEmail()).subscribe(
            stResp => {
                this.puBinding.removeGroup();
                this.selectedUserGroup = null;
            }
        );
    }

    changeGroupLimitations() {
        let limitations: boolean = !this.puBinding.isSubjectToGroupLimitations();
        this.groupsService.setGroupLimitationsToUser(this.project, this.selectedUser.getEmail(), this.puBinding.getGroup().iri, limitations).subscribe(
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

    toggleFilterProficencies() {
        this.filterProficiencies = !this.filterProficiencies;
        this.initAvailableLanguages();
    }

    private initAvailableLanguages() {
        this.availableLanguages = [];
        this.selectedLangs = [];
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
        });
        Languages.sortLanguages(this.puLanguages);
    }

    selectUserLang(lang: Language, event: MouseEvent) {
        this.handleClickInLangList(this.selectedUserLangs, lang, event);
    }

    selectLang(lang: Language, event: MouseEvent) {
        if (!this.isLangAlreadyAssigned(lang)) {
            this.handleClickInLangList(this.selectedLangs, lang, event);
        }
    }

    private handleClickInLangList(list: Language[], lang: Language, event: MouseEvent) {
        if (event.ctrlKey) { //ctrl+click => remove from selected langs if lang was selected, add it otherwise
            if (list.includes(lang)) { //was selected => remove it
                list.splice(list.indexOf(lang), 1);
            } else { //was not selected => add it
                list.push(lang);
            }
        } else { //not ctrl+click => just select/deselect the lang
            //empty the list and add lang (do not assign list=[lang] since in this way the reference of selectedUserLangs/selectedLangs changes)
            list.splice(0, list.length);
            list.push(lang);
        }
    }

    addLanguage() {
        this.selectedLangs.forEach(l => {
            this.puBinding.addLanguage(l.tag);
        });
        this.updateLanguagesOfUserInProject();
    }

    addAllLanguages() {
        let langs: string[] = [];
        this.projectLanguages.forEach(l => {
            langs.push(l.tag);
        });
        this.puBinding.setLanguages(langs);
        this.updateLanguagesOfUserInProject();
    }

    addProficienciesLangs() {
        this.projectLanguages.forEach(l => {
            if (!this.isLangAlreadyAssigned(l) && this.isProficiencyLang(l.tag)) {
                this.puBinding.addLanguage(l.tag);
            }
        });
        this.updateLanguagesOfUserInProject();
    }

    removeLanguage() {
        this.selectedUserLangs.forEach(l => {
            this.puBinding.removeLanguage(l.tag);
        });
        this.updateLanguagesOfUserInProject();
    }

    removeAllLanguages() {
        this.puBinding.setLanguages([]);
        this.updateLanguagesOfUserInProject();
    }

    leaveProficienciesLangs() {
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
        this.adminService.updateLanguagesOfUserInProject(this.project, this.selectedUser.getEmail(), this.puBinding.getLanguages()).subscribe(
            () => {
                this.selectedLangs = [];
                this.selectedUserLangs = [];
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

    loadTemplate() {
        this.sharedModals.loadConfiguration({ key: "ACTIONS.LOAD_TEMPLATE" }, ConfigurationComponents.TEMPLATE_STORE).then(
            (conf: LoadConfigurationModalReturnData) => {
                let templateProp: SettingsProp = conf.configuration.properties.find(p => p.name == "template");
                if (templateProp != null) {
                    this.puTemplate = templateProp.value;
                    this.updateTemplate();
                }
            }
        );
    }

    storeTemplate() {
        let config: { [key: string]: any } = {
            template: this.puTemplate
        };
        this.sharedModals.storeConfiguration({ key: "ACTIONS.SAVE_TEMPLATE" }, ConfigurationComponents.TEMPLATE_STORE, config);
    }

    private updateTemplate(project?: Project) {
        if (project == null) {
            project = this.project;
        }

        this.resViewPref.resViewPartitionFilter = this.puTemplate;
        this.settingsService.storeSettingForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.resourceView, this.resViewPref, project, this.selectedUser).subscribe(
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

    isSelectedUserAdmin(): boolean {
        if (this.selectedUser == null) {
            return false;
        } else {
            return this.selectedUser.isAdmin();
        }
    }

    isRoleManagementAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationUserRoleManagement);
    }
    isGroupManagementAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationUserGroupManagement);
    }

}


interface UserFilters { 
    languages: {
        filters: string[],
        and?: boolean
    };
    groups: {
        filters: UsersGroup[],
        preview?: string;
    };
    roles: {
        filters: Role[],
        and?: boolean;
        preview?: string;
    };
}