import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { CommitInfo } from "../../models/History";
import { HistoryValidationModalServices } from "./historyValidationModalServices";

export class ValidationCommentsModalData extends BSModalContext {
    constructor(public commits: CommitInfo[]) {
        super();
    }
}

@Component({
    selector: "validation-comments-modal",
    templateUrl: "./validationCommentsModal.html"
})
export class ValidationCommentsModal implements ModalComponent<ValidationCommentsModalData> {
    context: ValidationCommentsModalData;

    private commits: CommitInfo[] = [];

    constructor(public dialog: DialogRef<ValidationCommentsModalData>, private hvModals: HistoryValidationModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.context.commits.forEach(c => {
            //clone the commits, so in case the user cancel the validation, the changes in the commits would not affect the original commits
            let cloned = new CommitInfo(c.commit, c.user, c.operation, c.operationParameters, c.startTime, c.endTime, c.commentAllowed);
            cloned['comment'] = c['comment'];
            this.commits.push(cloned);
        });
    }

    inspectParams(commit: CommitInfo) {
        return this.hvModals.inspectParams(commit);
    }

    getCommitDelta(commit: CommitInfo) {
        return this.hvModals.getCommitDelta(commit);
    }

    ok(event: Event) {
        //apply the comment changes to the original input commits
        this.commits.forEach(commit => {
            this.context.commits.find(c => commit.commit.equals(c.commit))['comment'] = commit['comment'];
        });
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }

}