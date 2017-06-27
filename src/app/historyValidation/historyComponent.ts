import { Component } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { CommitDeltaModal, CommitDeltaModalData } from "./commitDeltaModal";
import { OperationSelectModal } from "./operationSelectModal";
import { HistoryServices } from "../services/historyServices";
import { CommitInfo, SortingDirection } from "../models/History";
import { ARTURIResource } from "../models/ARTResources";

@Component({
    selector: "history-component",
    templateUrl: "./historyComponent.html",
    host: { class: "pageComponent" }
})
export class HistoryComponent {

    //Sorting
    private sortingDirectionList: SortingDirection[] = [SortingDirection.Unordered, SortingDirection.Ascending, SortingDirection.Descending];
    private operationSorting: SortingDirection = this.sortingDirectionList[0]; //unordered default
    private timeSorting: SortingDirection = this.sortingDirectionList[2]; //descending default

    //Filters
    private showFilterBox: boolean = false;
    //operation
    private operations: ARTURIResource[] = [];
    //time
    private fromTime: any;
    private toTime: any;

    //paging
    private limit: number = 100;
    private page: number = 0;
    private pageCount: number;
    private revisionNumber: number = 0;
    private tipRevisionNumber: number;

    private commits: CommitInfo[];

    constructor(private historyService: HistoryServices, private modal: Modal) {}

    ngOnInit() {
        this.init();
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

    private listCommits() {
        this.historyService.getCommits(this.tipRevisionNumber, this.operations, this.getFormattedFromTime(), this.getFormattedToTime(),
            this.operationSorting, this.timeSorting, this.page, this.limit).subscribe(
            commits => {
                this.commits = commits;
            }
        );
    }

    private getPreviousCommits() {
        this.page--;
        this.listCommits();
    }

    private getNextCommits() {
        this.page++;
        this.listCommits();
    }

    private getCommitDelta(item: CommitInfo) {
        var modalData = new CommitDeltaModalData(item.commit);
        const builder = new BSModalContextBuilder<CommitDeltaModalData>(
            modalData, undefined, CommitDeltaModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).size('lg').toJSON() };
        return this.modal.open(CommitDeltaModal, overlayConfig).then(
            dialog => dialog.result
        );
    }

    //SORT HANDLER
    private sortOperation(direction: SortingDirection) {
        this.operationSorting = direction;
        this.init();
    }

    private sortTime(direction: SortingDirection) {
        this.timeSorting = direction;
        this.init();
    }

    //FILTERS HANDLER

    private toggleFilterBox() {
        this.showFilterBox = !this.showFilterBox;
    }

    private onFilterApplied(filters: { operations: ARTURIResource[], fromTime: string, toTime: string }) {
        this.operations = filters.operations;
        this.fromTime = filters.fromTime;
        this.toTime = filters.toTime;
        this.init();
    }

    private getFormattedFromTime(): string {
        if (this.fromTime == null) {
            return null;
        } else {
            return new Date(this.fromTime).toISOString();
        }
    }

    private getFormattedToTime(): string {
        if (this.toTime == null) {
            return null;
        } else {
            return new Date(this.toTime).toISOString();
        }
    }

}