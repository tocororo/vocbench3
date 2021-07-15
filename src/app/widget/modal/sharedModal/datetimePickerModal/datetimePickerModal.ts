import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "datetime-picker-modal",
    templateUrl: "./datetimePickerModal.html",
})
export class DatetimePickerModal {
    @Input() title: string;
    @Input() date: Date;

    constructor(public activeModal: NgbActiveModal) {}

    ok() {
        this.activeModal.close(this.date);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}