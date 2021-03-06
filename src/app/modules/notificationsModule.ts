import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationsComponent } from '../notifications/notificationsComponent';
import { NotificationSettingsModal } from '../notifications/notificationSettingsModal';
import { PreferencesModule } from './preferencesModule';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule, PreferencesModule],
    declarations: [
        NotificationsComponent,
        NotificationSettingsModal,
    ],
    exports: [],
    providers: [],
    entryComponents: [
        NotificationSettingsModal,
    ]
})
export class NotificationsModule { }