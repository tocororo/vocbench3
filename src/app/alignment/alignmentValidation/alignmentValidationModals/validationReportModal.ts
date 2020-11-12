import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "validation-report-modal",
    templateUrl: "./validationReportModal.html",
})
export class ValidationReportModal {
    @Input() report: Array<any>; //collection of object with entity1, entity2, property and action
    
    constructor(public activeModal: NgbActiveModal) {}
    
    ok() {
        this.activeModal.close();
    }

    cancel() {
        this.activeModal.dismiss();
    }
}