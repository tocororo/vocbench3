import { Component } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTResource, ARTURIResource } from "../models/ARTResources";
import { CommitInfo, SortingDirection } from "../models/History";
import { User } from "../models/User";
import { ResourceUtils } from "../utils/ResourceUtils";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { CommitDeltaModal, CommitDeltaModalData } from "./commitDeltaModal";
import { OperationParamsModal, OperationParamsModalData } from "./operationParamsModal";

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
    //performers
    performers: User[] = [];
    //time
    fromTime: any;
    toTime: any;

    //paging
    limit: number = 100;
    page: number = 0;
    pageCount: number;
    revisionNumber: number = 0;

    commits: CommitInfo[];

    constructor(private sharedModals: SharedModalServices, private modal: Modal) {}

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
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(OperationParamsModal, overlayConfig);
    }

    getCommitDelta(item: CommitInfo) {
        var modalData = new CommitDeltaModalData(item.commit);
        const builder = new BSModalContextBuilder<CommitDeltaModalData>(
            modalData, undefined, CommitDeltaModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('lg').keyboard(27).toJSON() };
        return this.modal.open(CommitDeltaModal, overlayConfig);
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

    onFilterApplied(filters: { operations: ARTURIResource[], performers: User[], fromTime: string, toTime: string }) {
        this.operations = filters.operations;
        this.performers = filters.performers;
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

    getPerformersIRI(): ARTURIResource[] {
        let performersIRI: ARTURIResource[];
        if (this.performers.length > 0) {
            performersIRI = [];
            this.performers.forEach((p: User) => {
                performersIRI.push(new ARTURIResource(p.getIri()));
            })
        }
        return performersIRI;
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

    private openValueResourceView(value: string) {
        try {
            let res: ARTResource;
            if (value.startsWith("<") && value.endsWith(">")) { //uri
                res = ResourceUtils.parseURI(value);
            } else if (value.startsWith("_:")) { //bnode
                res = ResourceUtils.parseBNode(value);
            }
            if (res != null) {
                this.sharedModals.openResourceView(res, true);
            }
        } catch (err) {
            //not parseable => not a resource
        } 
    }

}