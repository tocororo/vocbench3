import { Component } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { CommitDeltaModal, CommitDeltaModalData } from "./commitDeltaModal";
import { HistoryServices } from "../services/historyServices";
import { HistoryItem, HistoryItemUser, HistoryOperation } from "../models/History";
import { ARTURIResource } from "../models/ARTResources";

@Component({
    selector: "history-component",
    templateUrl: "./historyComponent.html",
    host: { class: "pageComponent" }
})
export class HistoryComponent {

    private history: HistoryItem[];
    private hasNext: boolean = false;

    constructor(private historyService: HistoryServices, private modal: Modal) {}

    ngOnInit() {
        this.listHistoryItems(null);
    }

    private listHistoryItems(parentCommit?: ARTURIResource) {
        this.historyService.getCommits(parentCommit).subscribe(
            commits => {
                this.history = commits.items;
                // this.parentCommit = this.history[this.history.length].commit; //set as parent commit the last one
                this.hasNext = commits.next;
            }
        )
    }

    private getPreviousCommits() {

    }

    private getNextCommits() {
        this.listHistoryItems(this.history[this.history.length-1].commit);
    }

    private getCommitDelta(item: HistoryItem) {
        var modalData = new CommitDeltaModalData(item.commit);
        const builder = new BSModalContextBuilder<CommitDeltaModalData>(
            modalData, undefined, CommitDeltaModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(CommitDeltaModal, overlayConfig).then(
            dialog => dialog.result
        );
    }

}