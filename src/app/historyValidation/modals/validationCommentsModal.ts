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

    constructor(public dialog: DialogRef<ValidationCommentsModalData>, private hvModals: HistoryValidationModalServices) {
        this.context = dialog.context;
    }

    inspectParams(commit: CommitInfo) {
        return this.hvModals.inspectParams(commit);
    }

    getCommitDelta(commit: CommitInfo) {
        return this.hvModals.getCommitDelta(commit);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}