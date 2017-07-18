import { Component, Input, SimpleChanges } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { UserProjBindingModal, UserProjBindingModalData } from "./userProjBindingModal";
import { User, Role, ProjectUserBinding } from "../../models/User";
import { Project } from "../../models/Project";
import { Language, LanguageUtils } from "../../models/LanguagesCountries";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { UserServices } from "../../services/userServices";
import { AdministrationServices } from "../../services/administrationServices";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";

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

    private langList: Language[]; //available languages for the selected project
    private selectedLang: Language; //role selected in langList (available langs)
    private selectedUserLang: Language; //selected lang in the list of the language assigned to the selectedUser in the selectedProject

    constructor(private userService: UserServices, private adminService: AdministrationServices, 
        private prefSettingsServices: PreferencesSettingsServices, private basicModals: BasicModalServices, private modal: Modal) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['project'] && changes['project'].currentValue) {
            this.userService.listUsersBoundToProject(this.project.getName()).subscribe(
                users => {
                    this.usersBound = users;
                    this.selectedUser = null;
                    this.puBinding = null;
                    this.selectedUserRole = null;
                }
            );
            this.adminService.listRoles(this.project).subscribe(
                roles => {
                    this.roleList = roles;
                }
            );
            this.prefSettingsServices.getProjectSettings(["languages"], this.project).subscribe(
                stResp => {
                    var langsValue = stResp["languages"];
                    try {
                        this.langList = <Language[]>JSON.parse(langsValue);
                        LanguageUtils.sortLanguages(this.langList);
                    } catch (err) {
                        this.basicModals.alert("Error", "Initialization of languages for project '" + this.project.getName() + 
                            "' has encountered a problem during parsing the 'languages' settings. " + 
                            "Please, report this to the system administrator.", "error");
                    }
                }
            )
        }
    }

    //==== USER PANEL ====

    private selectUser(user: User) {
        this.selectedUser = user;
        this.adminService.getProjectUserBinding(this.project.getName(), this.selectedUser.getEmail()).subscribe(
            puBinding => {
                this.puBinding = puBinding;
                this.selectedUserRole = null;
                this.selectedUserLang = null;
            }
        );
    }

    private addUserToProject() {
        var modalData = new UserProjBindingModalData("Add user to " + this.project.getName(), this.usersBound);
        const builder = new BSModalContextBuilder<UserProjBindingModalData>(
            modalData, undefined, UserProjBindingModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(UserProjBindingModal, overlayConfig).then(
            dialog => dialog.result.then(
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
            )
        );
    }

    private removeUserFromProject() {
        this.adminService.removeAllRolesFromUser(this.project.getName(), this.selectedUser.getEmail()).subscribe(
            stResp => {
                this.puBinding.addRole(this.selectedRole.getName());
                this.selectedRole = null;
            }
        );
    }

    //==== PROJECT-USER PROPERTIES PANEL ====

    //ROLES

    private selectUserRole(role: string) {
        if (this.selectedUserRole == role) {
            this.selectedUserRole = null;    
        } else {
            this.selectedUserRole = role;
        }
    }

    private selectRole(role: Role) {
        if (this.isAdmin()) {
            return
        }
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

    private isAddRoleDisabled(): boolean {
        return this.selectedRole == null || this.puBinding == null || this.isAdmin();
    }

    private isAdmin() {
        return VBContext.getLoggedUser().isAdmin();
    }
    
   
    //LANGUAGES

    private getPULanguages(): Language[] {
        var puLanguages: Language[] = [];
        var langs: string [] = this.puBinding.getLanguages();
        for (var i = 0; i < langs.length; i++) {
            for (var j = 0; j < this.langList.length; j++) {
                if (langs[i] == this.langList[j].tag) {
                    puLanguages.push(this.langList[j]);
                    break;
                }
            }
        }
        LanguageUtils.sortLanguages(puLanguages);
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
                this.selectedLang = null;
            }
        );
    }

    private removeLanguage() {
        this.puBinding.removeLanguage(this.selectedUserLang.tag);
        this.adminService.updateLanguagesOfUserInProject(this.project.getName(), this.selectedUser.getEmail(), this.puBinding.getLanguages()).subscribe(
            stResp => {
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

    private isInUserLangProficiencies(lang: Language): boolean {
        if (this.selectedUser != null) {
            return this.selectedUser.getLanguageProficiencies().indexOf(lang.tag) != -1;
        } else {
            return false;
        }
    }

}