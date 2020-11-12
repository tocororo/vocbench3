import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Issue, IssuesListCtx } from "../models/Collaboration";

@Component({
    selector: "issue-list-modal",
    templateUrl: "./issueListModal.html",
})
export class IssueListModal {

    issueCtx: IssuesListCtx = IssuesListCtx.Assignment;

    selectedIssue: Issue;

    constructor(public activeModal: NgbActiveModal) {}

    selectIssue(issue: Issue) {
        if (this.selectedIssue == issue) {
            this.selectedIssue = null;    
        } else {
            this.selectedIssue = issue;
        }
    }

    ok() {
        this.activeModal.close(this.selectedIssue);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}