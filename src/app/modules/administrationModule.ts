import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AdministrationComponent } from "../administration/administrationComponent";
import { adminRouting } from "../administration/administrationRoutes";
import { GroupEditorModal } from "../administration/groupsAdministration/groupEditorModal";
import { GroupsAdministrationComponent } from "../administration/groupsAdministration/groupsAdministrationComponent";
import { ProjectGroupsManagerComponent } from "../administration/projectsAdministration/projectGroupsManagerComponent";
import { ProjectsAdministrationComponent } from "../administration/projectsAdministration/projectsAdministrationComponent";
import { ProjectSettingsComponent } from "../administration/projectsAdministration/projectSettingsComponent";
import { ProjectUsersManagerComponent } from "../administration/projectsAdministration/projectUsersManagerComponent";
import { UserProjBindingModal } from "../administration/projectsAdministration/userProjBindingModal";
import { CapabilityEditorModal } from "../administration/rolesAdministration/capabilityEditorModal";
import { ImportRoleModal } from "../administration/rolesAdministration/importRoleModal";
import { RolesAdministrationComponent } from "../administration/rolesAdministration/rolesAdministrationComponent";
import { SystemConfigurationComponent } from '../administration/systemConfiguration/systemConfigurationComponent';
import { ForcePasswordModal } from '../administration/usersAdministration/forcePasswordModal';
import { UserCreateModal } from "../administration/usersAdministration/userCreateModal";
import { UserDetailsPanelComponent } from '../administration/usersAdministration/userDetailsPanelComponent';
import { UsersAdministrationComponent } from "../administration/usersAdministration/usersAdministrationComponent";
import { SharedModule } from './sharedModule';
import { UserModule } from './userModule';


@NgModule({
    imports: [
        adminRouting,
        CommonModule,
        FormsModule,
        NgbDropdownModule,
        SharedModule,
        UserModule],
    declarations: [
        AdministrationComponent,
        GroupsAdministrationComponent,
        ProjectGroupsManagerComponent,
        ProjectsAdministrationComponent,
        ProjectSettingsComponent,
        ProjectUsersManagerComponent,
        RolesAdministrationComponent,
        SystemConfigurationComponent,
        UsersAdministrationComponent,
        UserDetailsPanelComponent,
        //modals
        CapabilityEditorModal,
        ForcePasswordModal,
        GroupEditorModal,
        ImportRoleModal,
        UserCreateModal,
        UserProjBindingModal,
    ],
    exports: [AdministrationComponent],
    providers: [],
    entryComponents: [
        CapabilityEditorModal,
        ForcePasswordModal,
        GroupEditorModal,
        ImportRoleModal,
        UserCreateModal,
        UserProjBindingModal,
    ]
})
export class AdministrationModule { }