import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "manchester-modal",
    templateUrl: "./manchesterExprModal.html",
})
export class ManchesterExprModal {
    @Input() title: string = "Create a new manchester expression";
    @Input() expression: string;

    skipSemCheck: boolean;

    constructor(public activeModal: NgbActiveModal) {}

    isOkEnabled(): boolean {
        return this.expression != null && this.expression.trim() != "";
    }

    onSkipSemCheckChamge(check: boolean) {
        this.skipSemCheck = check;
    }

    ok() {
        let returnData: ManchesterExprModalReturnData = {
            expression: this.expression,
            skipSemCheck: this.skipSemCheck
        }
        this.activeModal.close(returnData);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

export interface ManchesterExprModalReturnData {
    expression: string;
    skipSemCheck: boolean;
}