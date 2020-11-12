import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommitInfo } from "../../models/History";
import { HistoryValidationModalServices } from "./historyValidationModalServices";

@Component({
    selector: "validation-comments-modal",
    templateUrl: "./validationCommentsModal.html"
})
export class ValidationCommentsModal {
    @Input() commitsInput: CommitInfo[];

    commits: CommitInfo[] = [];

    constructor(public activeModal: NgbActiveModal, private hvModals: HistoryValidationModalServices) {
    }

    ngOnInit() {
        this.commitsInput.forEach(c => {
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

    ok() {
        //apply the comment changes to the original input commits
        this.commits.forEach(commit => {
            this.commitsInput.find(c => commit.commit.equals(c.commit))['comment'] = commit['comment'];
        });
        this.activeModal.close();
    }

    cancel() {
        this.activeModal.dismiss();
    }

}