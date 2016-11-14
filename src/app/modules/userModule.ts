import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from "@angular/router";

import {SharedModule} from './sharedModule';

import {LoginComponent} from '../user/loginComponent';
import {UserProfileComponent} from '../user/userProfileComponent';
import {RegistrationComponent} from '../user/registrationComponent';
import {UserMenuComponent} from '../user/userMenuComponent';

@NgModule({
    imports: [CommonModule, FormsModule, RouterModule, SharedModule],
    declarations: [LoginComponent, RegistrationComponent, UserMenuComponent, UserProfileComponent],
    exports: [LoginComponent, RegistrationComponent, UserMenuComponent, UserProfileComponent],
    providers: []
})
export class UserModule { }