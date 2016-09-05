import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";

export class ValidationReportModalData extends BSModalContext {
    /**
     * @param report collection of object with entity1, entity2, property and action
     */
    constructor(public report: Array<any>) {
        super();
        this.size = "lg";
    }
}

@Component({
    selector: "validation-report-modal",
    templateUrl: "app/src/alignment/alignmentValidation/validationReportModal/validationReportModal.html",
})
export class ValidationReportModal implements ModalComponent<ValidationReportModalData> {
    context: ValidationReportModalData;
    
    constructor(public dialog: DialogRef<ValidationReportModalData>) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }
    
    ok(event) {
        event.stopPropagation();
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }
}