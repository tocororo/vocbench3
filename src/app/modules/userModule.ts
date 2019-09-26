import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { ChangePasswordModal } from '../user/changePasswordModal';
import { LoginComponent } from '../user/loginComponent';
import { RegistrationComponent } from '../user/registrationComponent';
import { ResetPasswordComponent } from '../user/resetPasswordComponent';
import { UserCreateComponent } from '../user/userCreateComponent';
import { UserMenuComponent } from '../user/userMenuComponent';
import { UserProfileComponent } from '../user/userProfileComponent';
import { SharedModule } from './sharedModule';
import { UserDetailsComponent } from '../user/userDetailsComponent';

@NgModule({
    imports: [CommonModule, FormsModule, RouterModule, SharedModule],
    declarations: [
        ChangePasswordModal,
        LoginComponent,
        RegistrationComponent,
        ResetPasswordComponent,
        UserCreateComponent,
        UserDetailsComponent,
        UserMenuComponent,
        UserProfileComponent,
    ],
    exports: [
        LoginComponent,
        UserCreateComponent,
        UserDetailsComponent,
        UserMenuComponent
    ],
    providers: [],
    entryComponents: [ChangePasswordModal]
})
export class UserModule { }