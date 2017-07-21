import { Component } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { CommitDeltaModal, CommitDeltaModalData } from "./commitDeltaModal";
import { OperationParamsModal, OperationParamsModalData } from "./operationParamsModal";
import { OperationSelectModal } from "./operationSelectModal";
import { HistoryServices } from "../services/historyServices";
import { CommitInfo, SortingDirection } from "../models/History";
import { ARTURIResource } from "../models/ARTResources";

/**
 * This abstract class is used to keep the attributes and mehtods that HistoryComponent and ValidationComponent have in common
 */
@Component({
    selector: "abs-hv-component",
    templateUrl: "./historyComponent.html",
    host: { class: "pageComponent" }
})
export abstract class AbstractHistValidComponent {

    //Sorting
    sortingDirectionList: SortingDirection[] = [SortingDirection.Unordered, SortingDirection.Ascending, SortingDirection.Descending];
    operationSorting: SortingDirection = this.sortingDirectionList[0]; //unordered default
    timeSorting: SortingDirection = this.sortingDirectionList[2]; //descending default

    //Filters
    showFilterBox: boolean = false;
    //operation
    operations: ARTURIResource[] = [];
    //time
    fromTime: any;
    toTime: any;

    //paging
    limit: number = 100;
    page: number = 0;
    pageCount: number;
    revisionNumber: number = 0;

    commits: CommitInfo[];

    constructor(private modal: Modal) {}

    ngOnInit() {
        this.init();
    }

    abstract init(): void;

    abstract listCommits(): void;

    getPreviousCommits() {
        this.page--;
        this.listCommits();
    }

    getNextCommits() {
        this.page++;
        this.listCommits();
    }

    inspectParams(item: CommitInfo) {
        var modalData = new OperationParamsModalData(item);
        const builder = new BSModalContextBuilder<OperationParamsModalData>(
            modalData, undefined, OperationParamsModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(OperationParamsModal, overlayConfig).then(
            dialog => dialog.result
        );
    }

    getCommitDelta(item: CommitInfo) {
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
    sortOperation(direction: SortingDirection) {
        this.operationSorting = direction;
        this.init();
    }

    sortTime(direction: SortingDirection) {
        this.timeSorting = direction;
        this.init();
    }

    //FILTERS HANDLER

    toggleFilterBox() {
        this.showFilterBox = !this.showFilterBox;
    }

    onFilterApplied(filters: { operations: ARTURIResource[], fromTime: string, toTime: string }) {
        this.operations = filters.operations;
        this.fromTime = filters.fromTime;
        this.toTime = filters.toTime;
        this.init();
    }

    getFormattedFromTime(): string {
        if (this.fromTime == null) {
            return null;
        } else {
            return new Date(this.fromTime).toISOString();
        }
    }

    getFormattedToTime(): string {
        if (this.toTime == null) {
            return null;
        } else {
            return new Date(this.toTime).toISOString();
        }
    }

    //Utility
    isLargeWidth(): boolean {
        return window.innerWidth > 1440;
    }

    showOtherParamButton(item: CommitInfo): boolean {
        if (this.isLargeWidth()) {
            return item.operationParameters.length > 3;
        } else {
            return item.operationParameters.length > 2;
        }
    }

}