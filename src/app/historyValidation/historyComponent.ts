import { Component } from "@angular/core";
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { HistoryServices } from "../services/historyServices";
import { UIUtils } from "../utils/UIUtils";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { AbstractHistValidComponent } from "./abstractHistValidComponent";

@Component({
    selector: "history-component",
    templateUrl: "./historyComponent.html",
    host: { class: "pageComponent" }
})
export class HistoryComponent extends AbstractHistValidComponent {

    //paging
    private tipRevisionNumber: number;

    constructor(private historyService: HistoryServices, sharedModals: SharedModalServices, modal: Modal) {
        super(sharedModals, modal);
    }

    init() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.page = 0;
        this.commits = [];
        this.historyService.getCommitSummary(this.operations, this.getPerformersIRI(), null, this.getFormattedFromTime(), this.getFormattedToTime(), this.limit).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.pageCount = stResp.pageCount;
                this.tipRevisionNumber = stResp.tipRevisionNumber;
                if (this.tipRevisionNumber != null) {
                    this.listCommits();
                }
            }
        );
    }

    listCommits() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.historyService.getCommits(this.tipRevisionNumber, this.operations, this.getPerformersIRI(), null, this.getFormattedFromTime(), this.getFormattedToTime(),
            this.operationSorting, this.timeSorting, this.page, this.limit).subscribe(
            commits => {
                this.commits = commits;
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
            }
        );
    }

}