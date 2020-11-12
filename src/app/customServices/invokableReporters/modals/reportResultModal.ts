import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Report, Section } from "../../../models/InvokableReporter";

@Component({
    selector: "report-modal",
    templateUrl: "./reportResultModal.html",
})
export class ReportResultModal {
    @Input() report: Report;

    jsonStringify = JSON.stringify;
    objectKeys = Object.keys;

    sections: Section[];

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        this.sections = this.report.sections;
    }


    ok() {
        this.activeModal.close();
    }

    
}