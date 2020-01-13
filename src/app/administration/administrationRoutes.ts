import { RouterModule, Routes } from '@angular/router';
import { AdminGuard, AuthGuard } from "../utils/CanActivateGuards";
import { AdministrationComponent } from "./administrationComponent";
import { GroupsAdministrationComponent } from './groupsAdministration/groupsAdministrationComponent';
import { ProjectsAdministrationComponent } from "./projectsAdministration/projectsAdministrationComponent";
import { RolesAdministrationComponent } from "./rolesAdministration/rolesAdministrationComponent";
import { SystemConfigurationComponent } from './systemConfiguration/systemConfigurationComponent';
import { TemplatesAdministrationComponent } from './templateAdministration/templatesAdministrationComponent';
import { UsersAdministrationComponent } from "./usersAdministration/usersAdministrationComponent";

export const routes: Routes = [
    {
        path: "Administration", component: AdministrationComponent, canActivate: [AuthGuard], children: [
            { path: "", redirectTo: "Projects", pathMatch: "full" },
            { path: "Users", component: UsersAdministrationComponent, canActivate: [AdminGuard] },
            { path: "Roles", component: RolesAdministrationComponent, canActivate: [AuthGuard] },
            { path: "Groups", component: GroupsAdministrationComponent, canActivate: [AuthGuard] },
            { path: "Projects", component: ProjectsAdministrationComponent, canActivate: [AuthGuard] },
            { path: "Configuration", component: SystemConfigurationComponent, canActivate: [AdminGuard] },
            { path: "Templates", component: TemplatesAdministrationComponent, canActivate: [AdminGuard] },
        ]
    },
];

export const adminRouting = RouterModule.forChild(routes);