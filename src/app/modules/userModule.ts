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

@NgModule({
    imports: [CommonModule, FormsModule, RouterModule, SharedModule],
    declarations: [LoginComponent, RegistrationComponent, UserMenuComponent, UserProfileComponent,
        UserCreateComponent, ResetPasswordComponent, ChangePasswordModal],
    exports: [LoginComponent, UserMenuComponent, UserCreateComponent],
    providers: [],
    entryComponents: [ChangePasswordModal]
})
export class UserModule { }