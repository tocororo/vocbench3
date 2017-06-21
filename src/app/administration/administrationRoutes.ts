import { RouterModule, Routes } from '@angular/router';

import { AdminGuard, CanDeactivateModalGuard } from "../utils/CanActivateGuards";

import { AdministrationComponent } from "./administrationComponent";
import { ConfigAdministrationComponent } from "./configAdministrationComponent";
import { UsersAdministrationComponent } from "./usersAdministrationComponent";
import { RolesAdministrationComponent } from "./rolesAdministrationComponent";
import { ProjectsAdministrationComponent } from "./projectsAdministrationComponent";

export const routes: Routes = [
    {
        path: "Administration", component: AdministrationComponent, canActivate: [AdminGuard], canDeactivate: [CanDeactivateModalGuard], children: [
            { path: "Users", component: UsersAdministrationComponent, canActivate: [AdminGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "Roles", component: RolesAdministrationComponent, canActivate: [AdminGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "Configuration", component: ConfigAdministrationComponent, canActivate: [AdminGuard], canDeactivate: [CanDeactivateModalGuard] },
            { path: "Projects", component: ProjectsAdministrationComponent, canActivate: [AdminGuard], canDeactivate: [CanDeactivateModalGuard] }
        ]
    },
];

export const adminRouting = RouterModule.forChild(routes);