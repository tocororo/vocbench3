import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdministrationComponent } from "../administration/administrationComponent";
import { adminRouting } from "../administration/administrationRoutes";
import { ConfigAdministrationComponent } from "../administration/configAdministration/configAdministrationComponent";
import { GroupEditorModal } from "../administration/groupsAdministration/groupEditorModal";
import { GroupsAdministrationComponent } from "../administration/groupsAdministration/groupsAdministrationComponent";
import { ProjectSettingsComponent } from "../administration/projectsAdministration/projectSettingsComponent";
import { ProjectUsersManagerComponent } from "../administration/projectsAdministration/projectUsersManagerComponent";
import { ProjectGroupsManagerComponent } from "../administration/projectsAdministration/projectGroupsManagerComponent";
import { ProjectsAdministrationComponent } from "../administration/projectsAdministration/projectsAdministrationComponent";
import { UserProjBindingModal } from "../administration/projectsAdministration/userProjBindingModal";
import { CapabilityEditorModal } from "../administration/rolesAdministration/capabilityEditorModal";
import { ImportRoleModal } from "../administration/rolesAdministration/importRoleModal";
import { RolesAdministrationComponent } from "../administration/rolesAdministration/rolesAdministrationComponent";
import { UserCreateModal } from "../administration/usersAdministration/userCreateModal";
import { UsersAdministrationComponent } from "../administration/usersAdministration/usersAdministrationComponent";
import { SharedModule } from './sharedModule';
import { UserModule } from './userModule';




@NgModule({
    imports: [CommonModule, FormsModule, adminRouting, SharedModule, UserModule],
    declarations: [
        AdministrationComponent,
        UsersAdministrationComponent, RolesAdministrationComponent, GroupsAdministrationComponent,
         ConfigAdministrationComponent, ProjectsAdministrationComponent,
        ProjectUsersManagerComponent, ProjectGroupsManagerComponent, ProjectSettingsComponent,
        //modals
        UserProjBindingModal, CapabilityEditorModal, ImportRoleModal, UserCreateModal, GroupEditorModal
    ],
    exports: [AdministrationComponent],
    providers: [],
    entryComponents: [
        UserProjBindingModal, CapabilityEditorModal, ImportRoleModal, UserCreateModal, GroupEditorModal
    ]
})
export class AdministrationModule { }