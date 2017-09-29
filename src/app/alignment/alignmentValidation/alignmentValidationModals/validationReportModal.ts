import {Component} from "@angular/core";
import {BSModalContext} from 'ngx-modialog/plugins/bootstrap';
import {DialogRef, ModalComponent} from "ngx-modialog";

export class ValidationReportModalData extends BSModalContext {
    /**
     * @param report collection of object with entity1, entity2, property and action
     */
    constructor(public report: Array<any>) {
        super();
    }
}

@Component({
    selector: "validation-report-modal",
    templateUrl: "./validationReportModal.html",
})
export class ValidationReportModal implements ModalComponent<ValidationReportModalData> {
    context: ValidationReportModalData;
    
    constructor(public dialog: DialogRef<ValidationReportModalData>) {
        this.context = dialog.context;
    }
    
    ok(event: Event) {
        event.stopPropagation();
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }
}