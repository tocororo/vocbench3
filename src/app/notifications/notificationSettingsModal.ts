import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';

@Component({
    selector: "notifications-settings-modal",
    templateUrl: "./notificationSettingsModal.html",
})
export class NotificationSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    constructor(public dialog: DialogRef<BSModalContext>) {
        this.context = dialog.context;
    }

    ok() {
        this.dialog.close();
    }

}