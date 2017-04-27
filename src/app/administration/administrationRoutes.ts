import {RouterModule, Routes} from '@angular/router';

import {AdminGuard} from "../utils/CanActivateGuards";

import {AdministrationComponent} from "./administrationComponent";
import {ConfigAdministrationComponent} from "./configAdministrationComponent";
import {UsersAdministrationComponent} from "./usersAdministrationComponent";
import {RolesAdministrationComponent} from "./rolesAdministrationComponent";
import {ProjectsAdministrationComponent} from "./projectsAdministrationComponent";

export const routes: Routes = [
    {path: "Administration", component: AdministrationComponent, canActivate: [AdminGuard], children: [
        {path: "Users", component: UsersAdministrationComponent, canActivate: [AdminGuard]},
        {path: "Roles", component: RolesAdministrationComponent, canActivate: [AdminGuard]},
        {path: "Configuration", component: ConfigAdministrationComponent, canActivate: [AdminGuard]},
        {path: "Projects", component: ProjectsAdministrationComponent, canActivate: [AdminGuard]}
    ]},
];

export const adminRouting = RouterModule.forChild(routes);