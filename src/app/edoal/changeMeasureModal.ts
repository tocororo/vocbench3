import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "change-measure-modal",
    templateUrl: "./changeMeasureModal.html",
})
export class ChangeMeasureModal {
    @Input() value: number;
    @Input() min: number = 0;
    @Input() max: number = 1;
    @Input() step: number = .01;

    constructor(public activeModal: NgbActiveModal) {}

    isInputValid(): boolean {
        return (typeof this.value == "number" && this.value >= 0 && this.value <= 1);
    }

    ok() {
        this.activeModal.close(this.value);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}