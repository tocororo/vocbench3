import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './sharedModule';
import { UserModule } from './userModule'; //just for UserCreateComponent

import { AdministrationComponent } from "../administration/administrationComponent";
import { UsersAdministrationComponent } from "../administration/usersAdministrationComponent";
import { RolesAdministrationComponent } from "../administration/rolesAdministrationComponent";
import { ConfigAdministrationComponent } from "../administration/configAdministrationComponent";
import { ProjectsAdministrationComponent } from "../administration/projectsAdministrationComponent";

//modals
import { UserProjBindingModal } from "../administration/administrationModals/userProjBindingModal";
import { CapabilityEditorModal } from "../administration/administrationModals/capabilityEditorModal";
import { ImportRoleModal } from "../administration/administrationModals/importRoleModal";
import { UserCreateModal } from "../administration/administrationModals/userCreateModal";

import { adminRouting } from "../administration/administrationRoutes";

@NgModule({
    imports: [CommonModule, FormsModule, adminRouting, SharedModule, UserModule],
    declarations: [
        AdministrationComponent,
        UsersAdministrationComponent, RolesAdministrationComponent, ConfigAdministrationComponent, ProjectsAdministrationComponent,
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