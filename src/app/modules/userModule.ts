import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ChangePasswordModal } from '../user/changePasswordModal';
import { LoginComponent } from '../user/loginComponent';
import { RegistrationComponent } from '../user/registrationComponent';
import { ResetPasswordComponent } from '../user/resetPasswordComponent';
import { UserCreateComponent } from '../user/userCreateComponent';
import { UserDetailsComponent } from '../user/userDetailsComponent';
import { UserMenuComponent } from '../user/userMenuComponent';
import { UserProfileComponent } from '../user/userProfileComponent';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        RouterModule,
        SharedModule,
        TranslateModule
    ],
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