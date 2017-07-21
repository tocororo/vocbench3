import { RouterModule, Routes } from '@angular/router';

import { AdminGuard, AuthGuard, CanDeactivateModalGuard } from "../utils/CanActivateGuards";

import { AdministrationComponent } from "./administrationComponent";
import { ConfigAdministrationComponent } from "./configAdministration/configAdministrationComponent";
import { UsersAdministrationComponent } from "./usersAdministration/usersAdministrationComponent";
import { RolesAdministrationComponent } from "./rolesAdministration/rolesAdministrationComponent";
import { ProjectsAdministrationComponent } from "./projectsAdministration/projectsAdministrationComponent";

export const routes: Routes = [
    {
        path: "Administration", component: AdministrationComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateModalGuard], children: [
            { path: "Users", component: UsersAdministrationComponent, canActivate: [AdminGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "Roles", component: RolesAdministrationComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "Configuration", component: ConfigAdministrationComponent, canActivate: [AdminGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "Projects", component: ProjectsAdministrationComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateModalGuard] }
        ]
    },
];

export const adminRouting = RouterModule.forChild(routes);