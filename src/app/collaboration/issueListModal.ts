import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Issue, IssuesListCtx } from "../models/Collaboration";


@Component({
    selector: "issue-list-modal",
    templateUrl: "./issueListModal.html",
})
export class IssueListModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private issueCtx: IssuesListCtx = IssuesListCtx.Assignment;

    private selectedIssue: Issue;

    constructor(public dialog: DialogRef<BSModalContext>) {
        this.context = dialog.context;
    }

    private selectIssue(issue: Issue) {
        if (this.selectedIssue == issue) {
            this.selectedIssue = null;    
        } else {
            this.selectedIssue = issue;
        }
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedIssue);
    }

    cancel() {
        this.dialog.dismiss();
    }

}