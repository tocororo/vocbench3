import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AdministrationComponent } from "../administration/administrationComponent";
import { adminRouting } from "../administration/administrationRoutes";
import { GroupEditorModal } from "../administration/groupsAdministration/groupEditorModal";
import { GroupsAdministrationComponent } from "../administration/groupsAdministration/groupsAdministrationComponent";
import { GroupSelectorModal } from '../administration/groupsAdministration/groupSelectorModal';
import { ProjectGroupsManagerComponent } from "../administration/projectsAdministration/projectGroupsManagerComponent";
import { ProjectsAdministrationComponent } from "../administration/projectsAdministration/projectsAdministrationComponent";
import { ProjectSettingsComponent } from "../administration/projectsAdministration/projectSettingsComponent";
import { ProjectUsersManagerComponent } from "../administration/projectsAdministration/projectUsersManagerComponent";
import { ResViewProjectSettingsComponent } from '../administration/projectsAdministration/resViewProjectSettingsComponent';
import { UserProjBindingModal } from "../administration/projectsAdministration/userProjBindingModal";
import { CapabilityEditorModal } from "../administration/rolesAdministration/capabilityEditorModal";
import { ImportRoleModal } from "../administration/rolesAdministration/importRoleModal";
import { RoleDescriptionModal } from '../administration/rolesAdministration/roleDescriptionModal';
import { RolesAdministrationComponent } from "../administration/rolesAdministration/rolesAdministrationComponent";
import { RoleSelectorModal } from '../administration/rolesAdministration/roleSelectorModal';
import { SettingsMgrConfigComponent } from '../administration/systemConfiguration/settingsMgrConfigComponent';
import { SystemConfigurationComponent } from '../administration/systemConfiguration/systemConfigurationComponent';
import { ForcePasswordModal } from '../administration/usersAdministration/forcePasswordModal';
import { UserCreateModal } from "../administration/usersAdministration/userCreateModal";
import { UserDetailsPanelComponent } from '../administration/usersAdministration/userDetailsPanelComponent';
import { UsersAdministrationComponent } from "../administration/usersAdministration/usersAdministrationComponent";
import { UsersListComponent } from '../administration/usersAdministration/usersListComponent';
import { SharedModule } from './sharedModule';
import { TreeAndListModule } from './treeAndListModule';
import { UserModule } from './userModule';


@NgModule({
    imports: [
        adminRouting,
        CommonModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        NgbPopoverModule,
        SharedModule,
        TranslateModule,
        TreeAndListModule,
        UserModule
    ],
    declarations: [
        AdministrationComponent,
        GroupsAdministrationComponent,
        ProjectGroupsManagerComponent,
        ProjectsAdministrationComponent,
        ProjectSettingsComponent,
        ProjectUsersManagerComponent,
        ResViewProjectSettingsComponent,
        RolesAdministrationComponent,
        SettingsMgrConfigComponent,
        SystemConfigurationComponent,
        UsersAdministrationComponent,
        UsersListComponent,
        UserDetailsPanelComponent,
        //modals
        CapabilityEditorModal,
        ForcePasswordModal,
        GroupEditorModal,
        GroupSelectorModal,
        ImportRoleModal,
        RoleDescriptionModal,
        RoleSelectorModal,
        UserCreateModal,
        UserProjBindingModal,
    ],
    exports: [AdministrationComponent],
    providers: [],
    entryComponents: [
        CapabilityEditorModal,
        ForcePasswordModal,
        GroupEditorModal,
        GroupSelectorModal,
        ImportRoleModal,
        RoleDescriptionModal,
        RoleSelectorModal,
        UserCreateModal,
        UserProjBindingModal,
    ]
})
export class AdministrationModule { }