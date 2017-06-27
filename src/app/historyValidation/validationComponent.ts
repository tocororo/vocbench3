import { Component } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { CommitDeltaModal, CommitDeltaModalData } from "./commitDeltaModal";
import { ValidationServices } from "../services/validationServices";
import { CommitInfo, SortingDirection } from "../models/History";
import { ARTURIResource } from "../models/ARTResources";
import { UIUtils } from "../utils/UIUtils";

@Component({
    selector: "validation-component",
    templateUrl: "./validationComponent.html",
    host: { class: "pageComponent" }
})
export class ValidationComponent {

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
    private tipTime: string;

    private commits: CommitInfo[];

    private ACTION_ACCEPT = { value: "accept", show: "Accept" };
    private ACTION_REJECT = { value: "reject", show: "Reject" };
    private validationActions: { value: string, show: string }[] = [
        { value: null, show: "------" },
        this.ACTION_ACCEPT,
        this.ACTION_REJECT
    ];

    constructor(private validationService: ValidationServices, private modal: Modal) { }

    ngOnInit() {
        this.init();
    }

    private init() {
        this.commits = [];
        this.validationService.getStagedCommitSummary(this.operations, this.getFormattedFromTime(), this.getFormattedToTime(), this.limit).subscribe(
            stResp => {
                this.pageCount = stResp.pageCount;
                this.tipTime = stResp.tipTime;
                if (this.tipTime != null) {
                    this.listCommits();
                }
            }
        );
    }

    private listCommits() {
        this.validationService.getCommits(this.tipTime, this.operations, this.getFormattedFromTime(), 
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

    private acceptAll() {
        for (var i = 0; i < this.commits.length; i++) {
            this.commits[i]['validationAction'] = this.ACTION_ACCEPT.value;
        }
    }

    private rejectAll() {
        for (var i = 0; i < this.commits.length; i++) {
            this.commits[i]['validationAction'] = this.ACTION_REJECT.value;
        }
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

    private validate() {
        var validationFnArray: any[] = []; //all commits to accept or reject
        //collect commits to accept and reject
        for (var i = 0; i < this.commits.length; i++) {
            if (this.commits[i]['validationAction'] == this.ACTION_ACCEPT.value) {
                validationFnArray.push(this.validationService.accept(this.commits[i].commit));
            }
            if (this.commits[i]['validationAction'] == this.ACTION_REJECT.value) {
                validationFnArray.push(this.validationService.reject(this.commits[i].commit));//this is undefined....WHY???????????
            }
        }
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        Observable.forkJoin(validationFnArray).subscribe(
            res => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.init();
            }
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