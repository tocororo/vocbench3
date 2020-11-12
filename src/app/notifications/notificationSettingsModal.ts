import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "notifications-settings-modal",
    templateUrl: "./notificationSettingsModal.html",
})
export class NotificationSettingsModal {

    constructor(public activeModal: NgbActiveModal) {}

    ok() {
        this.activeModal.close();
    }

}