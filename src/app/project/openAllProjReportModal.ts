import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExceptionDAO, FailReport } from "../models/Project";

@Component({
    selector: "open-projects-report-modal",
    templateUrl: "./openAllProjReportModal.html",
    styles: ['.stacktrace { max-height: 100px; overflow: auto; white-space: pre; }']
})
export class OpenAllProjReportModal {
    @Input() report: {[key: string]: ExceptionDAO };

    failReports: FailReport[];

    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {
        this.failReports = [];
        for (let projId in this.report) {
            this.failReports.push({
                offensiveElemId: projId,
                exception: this.report[projId]
            })
        }
    }

    ok() {
        this.activeModal.close();
    }

}