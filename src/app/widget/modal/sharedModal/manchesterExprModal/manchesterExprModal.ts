import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "manchester-modal",
    templateUrl: "./manchesterExprModal.html",
})
export class ManchesterExprModal {
    @Input() title: string = "Create a new manchester expression";
    @Input() expression: string;

    constructor(public activeModal: NgbActiveModal) {}

    isOkEnabled(): boolean {
        return this.expression != null && this.expression.trim() != "";
    }

    ok() {
        this.activeModal.close(this.expression);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}