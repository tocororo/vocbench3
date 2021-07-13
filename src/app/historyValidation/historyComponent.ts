import { Component } from "@angular/core";
import { HistoryServices } from "../services/historyServices";
import { UIUtils } from "../utils/UIUtils";
import { VBEventHandler } from "../utils/VBEventHandler";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { AbstractHistValidComponent } from "./abstractHistValidComponent";
import { HistoryValidationModalServices } from "./modals/historyValidationModalServices";

@Component({
    selector: "history-component",
    templateUrl: "./historyComponent.html",
    host: { class: "pageComponent" }
})
export class HistoryComponent extends AbstractHistValidComponent {

    //paging
    private tipRevisionNumber: number;

    constructor(private historyService: HistoryServices, sharedModals: SharedModalServices, hvModals: HistoryValidationModalServices, eventHandler: VBEventHandler) {
        super(sharedModals, hvModals, eventHandler);
    }

    ngOnInit() {
        this.init();
    }

    init() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.page = 0;
        this.commits = [];
        this.historyService.getCommitSummary(this.operations, this.getPerformersIRI(), null, null, this.getFormattedFromTime(), this.getFormattedToTime(), this.limit).subscribe(
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
        this.historyService.getCommits(this.tipRevisionNumber, this.operations, this.getPerformersIRI(), null, null, this.getFormattedFromTime(), this.getFormattedToTime(),
            this.operationSorting.id, this.timeSorting.id, this.page, this.limit).subscribe(
            commits => {
                this.commits = commits;
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
            }
        );
    }

}