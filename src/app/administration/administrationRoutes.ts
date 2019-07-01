import { RouterModule, Routes } from '@angular/router';
import { AdminGuard, AuthGuard } from "../utils/CanActivateGuards";
import { AdministrationComponent } from "./administrationComponent";
import { ConfigAdministrationComponent } from "./configAdministration/configAdministrationComponent";
import { GroupsAdministrationComponent } from './groupsAdministration/groupsAdministrationComponent';
import { ProjectsAdministrationComponent } from "./projectsAdministration/projectsAdministrationComponent";
import { RolesAdministrationComponent } from "./rolesAdministration/rolesAdministrationComponent";
import { UsersAdministrationComponent } from "./usersAdministration/usersAdministrationComponent";

export const routes: Routes = [
    {
        path: "Administration", component: AdministrationComponent, canActivate: [AuthGuard], children: [
            { path: "", redirectTo: "Projects", pathMatch: "full" },
            { path: "Users", component: UsersAdministrationComponent, canActivate: [AdminGuard] },
            { path: "Roles", component: RolesAdministrationComponent, canActivate: [AuthGuard] },
            { path: "Groups", component: GroupsAdministrationComponent, canActivate: [AuthGuard] },
            { path: "Configuration", component: ConfigAdministrationComponent, canActivate: [AdminGuard] },
            { path: "Projects", component: ProjectsAdministrationComponent, canActivate: [AuthGuard] }
        ]
    },
];

export const adminRouting = RouterModule.forChild(routes);