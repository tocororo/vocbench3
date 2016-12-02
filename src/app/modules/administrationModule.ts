import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {AdministrationComponent} from "../administration/administrationComponent";
import {UsersAdministrationComponent} from "../administration/usersAdministrationComponent";
import {RolesAdministrationComponent} from "../administration/rolesAdministrationComponent";
import {ConfigAdministrationComponent} from "../administration/configAdministrationComponent";
import {ProjectsAdministrationComponent} from "../administration/projectsAdministrationComponent";

import {adminRouting} from "../administration/administrationRoutes";

@NgModule({
    imports: [CommonModule, FormsModule, adminRouting],
    declarations: [
        UsersAdministrationComponent,
        RolesAdministrationComponent,
        ConfigAdministrationComponent,
        ProjectsAdministrationComponent
    ],
    exports: [],
    providers: []
})
export class AdministrationModule { }