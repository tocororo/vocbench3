import { RouterModule, Routes } from '@angular/router';
import { AdminGuard, AuthGuard } from "../utils/CanActivateGuards";
import { AdministrationComponent } from "./administrationComponent";
import { GroupsAdministrationComponent } from './groupsAdministration/groupsAdministrationComponent';
import { ProjectsAdministrationComponent } from "./projectsAdministration/projectsAdministrationComponent";
import { RolesAdministrationComponent } from "./rolesAdministration/rolesAdministrationComponent";
import { SystemConfigurationComponent } from './systemConfiguration/systemConfigurationComponent';
import { SettingsMgrConfigComponent } from './systemConfiguration/settingsMgrConfigComponent';
import { UsersAdministrationComponent } from "./usersAdministration/usersAdministrationComponent";

export const routes: Routes = [
    {
        path: "", component: AdministrationComponent, canActivate: [AuthGuard], children: [
            { path: "", redirectTo: "Projects", pathMatch: "full" },
            { path: "Users", component: UsersAdministrationComponent, canActivate: [AdminGuard] },
            { path: "Roles", component: RolesAdministrationComponent, canActivate: [AuthGuard] },
            { path: "Groups", component: GroupsAdministrationComponent, canActivate: [AuthGuard] },
            { path: "Projects", component: ProjectsAdministrationComponent, canActivate: [AuthGuard] },
            { path: "Configuration", component: SystemConfigurationComponent, canActivate: [AdminGuard] },
            { path: "SettingsMgr", component: SettingsMgrConfigComponent, canActivate: [AdminGuard] },
        ]
    },
];

export const adminRouting = RouterModule.forChild(routes);