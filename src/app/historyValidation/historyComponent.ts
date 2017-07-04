import { Component } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { CommitDeltaModal, CommitDeltaModalData } from "./commitDeltaModal";
import { OperationParamsModal, OperationParamsModalData } from "./operationParamsModal";
import { OperationSelectModal } from "./operationSelectModal";
import { HistoryServices } from "../services/historyServices";
import { CommitInfo, SortingDirection } from "../models/History";
import { ARTURIResource } from "../models/ARTResources";
import { AbstractHistValidComponent } from "./abstractHistValidComponent";

@Component({
    selector: "history-component",
    templateUrl: "./historyComponent.html",
    host: { class: "pageComponent" }
})
export class HistoryComponent extends AbstractHistValidComponent {

    //paging
    private tipRevisionNumber: number;

    constructor(private historyService: HistoryServices, modal: Modal) {
        super(modal);
    }

    init() {
        this.commits = [];
        this.historyService.getCommitSummary(this.operations, this.getFormattedFromTime(), this.getFormattedToTime(), this.limit).subscribe(
            stResp => {
                this.pageCount = stResp.pageCount;
                this.tipRevisionNumber = stResp.tipRevisionNumber;
                if (this.tipRevisionNumber != null) {
                    this.listCommits();
                }
            }
        );
    }

    listCommits() {
        this.historyService.getCommits(this.tipRevisionNumber, this.operations, this.getFormattedFromTime(), this.getFormattedToTime(),
            this.operationSorting, this.timeSorting, this.page, this.limit).subscribe(
            commits => {
                this.commits = commits;
            }
        );
    }

}