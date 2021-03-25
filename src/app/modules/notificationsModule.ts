import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationsComponent } from '../notifications/notificationsComponent';
import { NotificationSettingsModal } from '../notifications/notificationSettingsModal';
import { PreferencesModule } from './preferencesModule';
import { SharedModule } from './sharedModule';

@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        PreferencesModule,
        SharedModule,
        TranslateModule
    ],
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