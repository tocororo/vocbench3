import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractConfirmModal } from './abstractConfirmModal';

@Component({
    selector: "confirm-modal",
    templateUrl: "./confirmModal.html",
    styleUrls: ['../../modals.css']
})
export class ConfirmModal extends AbstractConfirmModal {

    constructor(public activeModal: NgbActiveModal) {
        super(activeModal);
    }

    ok() {
        this.activeModal.close();
    }

    close() {
        this.activeModal.dismiss();
    }

}