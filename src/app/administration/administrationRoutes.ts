import { RouterModule, Routes } from '@angular/router';

import { AdminGuard, AuthGuard } from "../utils/CanActivateGuards";

import { AdministrationComponent } from "./administrationComponent";
import { ConfigAdministrationComponent } from "./configAdministration/configAdministrationComponent";
import { UsersAdministrationComponent } from "./usersAdministration/usersAdministrationComponent";
import { RolesAdministrationComponent } from "./rolesAdministration/rolesAdministrationComponent";
import { ProjectsAdministrationComponent } from "./projectsAdministration/projectsAdministrationComponent";

export const routes: Routes = [
    {
        path: "Administration", component: AdministrationComponent, canActivate: [AuthGuard], children: [
            { path: "Users", component: UsersAdministrationComponent, canActivate: [AdminGuard] },
            { path: "Roles", component: RolesAdministrationComponent, canActivate: [AuthGuard] },
            { path: "Configuration", component: ConfigAdministrationComponent, canActivate: [AdminGuard] },
            { path: "Projects", component: ProjectsAdministrationComponent, canActivate: [AuthGuard] }
        ]
    },
];

export const adminRouting = RouterModule.forChild(routes);