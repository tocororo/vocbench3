import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationsComponent } from '../notifications/notificationsComponent';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        NotificationsComponent
    ],
    exports: [],
    providers: [],
    entryComponents: []
})
export class NotificationsModule { }