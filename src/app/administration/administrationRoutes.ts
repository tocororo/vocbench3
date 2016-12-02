import {RouterModule, Routes} from '@angular/router';

import {AuthGuard} from "../utils/CanActivateGuards";

import {AdministrationComponent} from "./administrationComponent";
import {ConfigAdministrationComponent} from "./configAdministrationComponent";
import {UsersAdministrationComponent} from "./usersAdministrationComponent";
import {RolesAdministrationComponent} from "./rolesAdministrationComponent";
import {ProjectsAdministrationComponent} from "./projectsAdministrationComponent";

export const routes: Routes = [
    {path: "Administration", component: AdministrationComponent, canActivate: [AuthGuard], children: [
        {path: "Users", component: UsersAdministrationComponent, canActivate: [AuthGuard]},
        {path: "Roles", component: RolesAdministrationComponent, canActivate: [AuthGuard]},
        {path: "Configuration", component: ConfigAdministrationComponent, canActivate: [AuthGuard]},
        {path: "Projects", component: ProjectsAdministrationComponent, canActivate: [AuthGuard]}
    ]},
];

export const adminRouting = RouterModule.forChild(routes);