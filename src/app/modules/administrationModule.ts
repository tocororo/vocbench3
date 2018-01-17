import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './sharedModule';
import { UserModule } from './userModule'; //just for UserCreateComponent

import { AdministrationComponent } from "../administration/administrationComponent";
import { UsersAdministrationComponent } from "../administration/usersAdministration/usersAdministrationComponent";
import { RolesAdministrationComponent } from "../administration/rolesAdministration/rolesAdministrationComponent";
import { ConfigAdministrationComponent } from "../administration/configAdministration/configAdministrationComponent";
import { ProjectsAdministrationComponent } from "../administration/projectsAdministration/projectsAdministrationComponent";
import { ProjectUsersManagerComponent } from "../administration/projectsAdministration/projectUsersManagerComponent";
import { ProjectSettingsComponent } from "../administration/projectsAdministration/projectSettingsComponent";

//modals
import { UserProjBindingModal } from "../administration/projectsAdministration/userProjBindingModal";
import { CapabilityEditorModal } from "../administration/rolesAdministration/capabilityEditorModal";
import { ImportRoleModal } from "../administration/rolesAdministration/importRoleModal";
import { UserCreateModal } from "../administration/usersAdministration/userCreateModal";

import { adminRouting } from "../administration/administrationRoutes";

@NgModule({
    imports: [CommonModule, FormsModule, adminRouting, SharedModule, UserModule],
    declarations: [
        AdministrationComponent,
        UsersAdministrationComponent, RolesAdministrationComponent, ConfigAdministrationComponent, ProjectsAdministrationComponent,
        ProjectUsersManagerComponent, ProjectSettingsComponent,
        //modals
        UserProjBindingModal, CapabilityEditorModal, ImportRoleModal, UserCreateModal
    ],
    exports: [AdministrationComponent],
    providers: [],
    entryComponents: [
        UserProjBindingModal, CapabilityEditorModal, ImportRoleModal, UserCreateModal
    ]
})
export class AdministrationModule { }