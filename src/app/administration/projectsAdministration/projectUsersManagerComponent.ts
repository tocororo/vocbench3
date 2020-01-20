import { Component, Input, SimpleChanges } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ConfigurationComponents } from "../../models/Configuration";
import { Language, Languages } from "../../models/LanguagesCountries";
import { SettingsProp } from "../../models/Plugins";
import { Project } from "../../models/Project";
import { PartitionFilterPreference, Properties } from "../../models/Properties";
import { ProjectUserBinding, Role, User, UsersGroup } from "../../models/User";
import { AdministrationServices } from "../../services/administrationServices";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";
import { UserServices } from "../../services/userServices";
import { UsersGroupsServices } from "../../services/usersGroupsServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../../utils/VBActions";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { LoadConfigurationModalReturnData } from "../../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { UserProjBindingModal, UserProjBindingModalData } from "./userProjBindingModal";

@Component({
    selector: "project-users-manager",
    templateUrl: "./projectUsersManagerComponent.html",
})
export class ProjectUsersManagerComponent {

    @Input() project: Project

    private usersBound: User[]; //list of User bound to selected project 
    private selectedUser: User; //user selected in the list of bound users

    private puBinding: ProjectUserBinding; //binding between selectedProject and selectedUser

    private roleList: Role[]; //all available roles for the selected project
    private selectedRole: Role; //role selected in roleList (available roles)
    private selectedUserRole: string; //selected role in the list of the roles assigned to selectedUser in the selectedProject

    private projectLanguages: Language[]; //available languages for the selected project
    private selectedLang: Language; //role selected in langList (available langs)
    private selectedUserLang: Language; //selected lang in the list of the language assigned to the selectedUser in the selectedProject

    private groupList: UsersGroup[];
    private selectedGroup: UsersGroup;
    private selectedUserGroup: UsersGroup;

    private puTemplate: PartitionFilterPreference;

    constructor(private userService: UserServices, private adminService: AdministrationServices, private groupsService: UsersGroupsServices, 
        private prefSettingsServices: PreferencesSettingsServices, private vbProp: VBProperties,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modal: Modal) { }


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
            this.prefSettingsServices.getProjectSettings(["languages"], this.project).subscribe(
                stResp => {
                    var langsValue = stResp["languages"];
                    try {
                        this.projectLanguages = <Language[]>JSON.parse(langsValue);
                        Languages.sortLanguages(this.projectLanguages);
                    } catch (err) {
                        this.basicModals.alert("Error", "Initialization of languages for project '" + this.project.getName() + 
                            "' has encountered a problem during parsing the 'languages' settings. " + 
                            "Please, report this to the system administrator.", "error");
                    }
                }
            );
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
            }
        );
        /**
         * Init template; only if admin (required in order to allow to read/edit settings of other users)
         */
        if (this.isLoggedUserAdmin()) {
            this.prefSettingsServices.getPUSettingsOfUser([Properties.pref_res_view_partition_filter], this.selectedUser, this.project).subscribe(
                prefs => {
                    let partitionFilter: PartitionFilterPreference;
                    let value = prefs[Properties.pref_res_view_partition_filter];
                    if (value != null) {
                        partitionFilter = JSON.parse(value);
                    }
                    this.puTemplate = partitionFilter;
                }
            )
        }
    }

    private addUserToProject() {
        var modalData = new UserProjBindingModalData("Add user to " + this.project.getName(), this.project, this.usersBound);
        const builder = new BSModalContextBuilder<UserProjBindingModalData>(
            modalData, undefined, UserProjBindingModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(UserProjBindingModal, overlayConfig).result.then(
            data => {
                var user: User = data.user;
                var roles: string[] = data.roles;
                this.adminService.addRolesToUser(this.project.getName(), user.getEmail(), roles).subscribe(
                    stResp => {
                        this.usersBound.push(user);
                    }
                )
            },
            () => { }
        );
    }

    private removeUserFromProject() {
        this.basicModals.confirm("Remove user", "You are removing the user " + this.selectedUser.getShow() + " form the project " + this.project.getName() + ". Are you sure?", "warning").then(
            () => {
                this.adminService.removeUserFromProject(this.project.getName(), this.selectedUser.getEmail()).subscribe(
                    stResp => {
                        for (var i = 0; i < this.usersBound.length; i++) {
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
            () => {}
        );
    }

    /** ==========================
     * PROJECT-USER SETTINGS PANEL
     * ========================== */

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
        var pubRoles: string[] = this.puBinding.getRoles();
        for (var i = 0; i < pubRoles.length; i++) {
            if (pubRoles[i] == role.getName()) {
                return true;
            }
        }
        return false;
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

    private getPULanguages(): Language[] {
        var puLanguages: Language[] = [];
        var langs: string [] = this.puBinding.getLanguages();
        for (var i = 0; i < langs.length; i++) {
            for (var j = 0; j < this.projectLanguages.length; j++) {
                if (langs[i] == this.projectLanguages[j].tag) {
                    puLanguages.push(this.projectLanguages[j]);
                    break;
                }
            }
        }
        Languages.sortLanguages(puLanguages);
        return puLanguages;
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
        this.adminService.updateLanguagesOfUserInProject(this.project.getName(), this.selectedUser.getEmail(), this.puBinding.getLanguages()).subscribe(
            stResp => {
                this.updateLanguagesOfUserInProjectAfterAdd();
            }
        );
    }

    private addAllLanguages() {
        let langs: string[] = [];
        this.projectLanguages.forEach(l => {
            langs.push(l.tag);
        });
        this.puBinding.setLanguages(langs);
        this.updateLanguagesOfUserInProjectAfterAdd();
    }

    private addProficienciesLangs() {
        this.projectLanguages.forEach(l => {
            if (!this.isLangAlreadyAssigned(l) && this.isInUserLangProficiencies(l.tag)) {
                this.puBinding.addLanguage(l.tag);
            }
        });
        this.updateLanguagesOfUserInProjectAfterAdd();
    }

    private updateLanguagesOfUserInProjectAfterAdd() {
        this.adminService.updateLanguagesOfUserInProject(this.project.getName(), this.selectedUser.getEmail(), this.puBinding.getLanguages()).subscribe(
            stResp => {
                VBContext.setProjectUserBinding(this.puBinding);
                this.selectedLang = null;
            }
        );
    }

    private removeLanguage() {
        this.puBinding.removeLanguage(this.selectedUserLang.tag);
        this.updateLanguagesOfUserInProjectAfterRemove();
    }

    private removeAllLanguages() {
        this.puBinding.setLanguages([]);
        this.updateLanguagesOfUserInProjectAfterRemove();
    }

    private leaveProficienciesLangs() {
        let langs: string[] = [];
        this.puBinding.getLanguages().forEach(l => {
            if (this.isInUserLangProficiencies(l)) {
                langs.push(l);
            }
        });
        this.puBinding.setLanguages(langs);
        this.updateLanguagesOfUserInProjectAfterRemove();
    }

    private updateLanguagesOfUserInProjectAfterRemove() {
        this.adminService.updateLanguagesOfUserInProject(this.project.getName(), this.selectedUser.getEmail(), this.puBinding.getLanguages()).subscribe(
            stResp => {
                //if no languages are assigned for the admin => assign all project languages
                if (this.selectedUser.isAdmin() && this.getPULanguages().length == 0) {
                    this.puBinding.setLanguages(Languages.fromLanguagesToTags(this.projectLanguages));
                }
                VBContext.setProjectUserBinding(this.puBinding);
                this.selectedUserLang = null;
            }
        );
    }


    private isLangAlreadyAssigned(lang: Language): boolean {
        if (this.puBinding == undefined) {
            return true;
        }
        var pubLanguages: string[] = this.puBinding.getLanguages();
        for (var i = 0; i < pubLanguages.length; i++) {
            if (pubLanguages[i] == lang.tag) {
                return true;
            }
        }
        return false;
    }

    private isInUserLangProficiencies(lang: string): boolean {
        if (this.selectedUser != null) {
            return this.selectedUser.getLanguageProficiencies().indexOf(lang) != -1;
        } else {
            return false;
        }
    }

    //=========== TEMPLATES ===========

    private loadTemplate() {
        this.sharedModals.loadConfiguration("Load template", ConfigurationComponents.TEMPLATE_STORE).then(
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
        this.sharedModals.storeConfiguration("Store template", ConfigurationComponents.TEMPLATE_STORE, config);
    }

    private updateTemplate() {
        this.prefSettingsServices.setPUSettingOfUser(Properties.pref_res_view_partition_filter, this.selectedUser, JSON.stringify(this.puTemplate), this.project).subscribe(
            () => {
                //in case the setting has been changed for the logged user and the project currently accessed => update its cached PU-settings
                if (
                    VBContext.getWorkingProject() != null && VBContext.getWorkingProject().getName() == this.project.getName() && //current accessed project
                    VBContext.getLoggedUser().getEmail() == this.selectedUser.getEmail() //current logged user
                ) {
                    this.vbProp.refreshResourceViewPartitionFilter().subscribe();
                }
            }
        );
    }



    //AUTH

    private isLoggedUserAdmin(): boolean {
        return VBContext.getLoggedUser().isAdmin();
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