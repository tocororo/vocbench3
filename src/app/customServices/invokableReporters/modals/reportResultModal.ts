import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Report, Section } from "../../../models/InvokableReporter";

export class ReportResultModalData extends BSModalContext {
    /**
     * @param report
     */
    constructor(public report: Report) {
        super();
    }
}

@Component({
    selector: "report-modal",
    templateUrl: "./reportResultModal.html",
})
export class ReportResultModal implements ModalComponent<ReportResultModalData> {
    context: ReportResultModalData;

    jsonStringify = JSON.stringify;
    objectKeys = Object.keys;

    private sections: Section[];

    constructor(public dialog: DialogRef<ReportResultModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.sections = this.context.report.sections;
    }


    ok() {
        this.dialog.close();
    }

    
}