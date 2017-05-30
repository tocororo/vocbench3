import { Component } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { HistoryServices } from "../services/historyServices";
import { CommitOperation } from "../models/History";
import { ARTURIResource } from "../models/ARTResources";

export class CommitDeltaModalData extends BSModalContext {
    constructor(public commit: ARTURIResource) {
        super();
    }
}

@Component({
    selector: "commit-modal",
    templateUrl: "./commitDeltaModal.html",
})
export class CommitDeltaModal implements ModalComponent<CommitDeltaModalData> {
    context: CommitDeltaModalData;


    private additions: CommitOperation[];
    private removals: CommitOperation[];

    constructor(public dialog: DialogRef<CommitDeltaModalData>, private historyService: HistoryServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.historyService.getCommitDelta(this.context.commit).subscribe(
            delta => {
                this.additions = delta.additions;
                this.removals = delta.removals;
            }
        );
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}