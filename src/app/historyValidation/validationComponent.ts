import { Component } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { CommitDeltaModal, CommitDeltaModalData } from "./commitDeltaModal";
import { ValidationServices } from "../services/validationServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { CommitInfo, SortingDirection } from "../models/History";
import { ARTURIResource, ARTResource } from "../models/ARTResources";
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
    private ACTION_NONE = { value: "------", show: "------" };
    private validationActions: { value: string, show: string }[] = [
        this.ACTION_NONE,
        this.ACTION_ACCEPT,
        this.ACTION_REJECT
    ];

    constructor(private validationService: ValidationServices, private sharedModals: SharedModalServices, private modal: Modal) { }

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
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.validationService.getCommits(this.tipTime, this.operations, this.getFormattedFromTime(), 
            this.operationSorting, this.timeSorting, this.page, this.limit).subscribe(
            commits => {
                this.commits = commits;
                this.commits.forEach(c => c['validationAction'] = this.ACTION_NONE);
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
            }
        );
    }

    private openResource(resource: ARTResource) {
        if (resource.isResource()) {
            this.sharedModals.openResourceView(resource);
        }
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
            this.commits[i]['validationAction'] = this.ACTION_ACCEPT;
        }
    }

    private rejectAll() {
        for (var i = 0; i < this.commits.length; i++) {
            this.commits[i]['validationAction'] = this.ACTION_REJECT;
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
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.validateCommitsRecursively(this.commits.slice());
    }

    /**
     * Accept or reject commits one after the other
     * @param commits 
     */
    private validateCommitsRecursively(commits: CommitInfo[]) {
        var validationFunctions: any;
        if (commits.length == 0) {
            UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
            this.init();
        } else {
            if (commits[0]['validationAction'] == this.ACTION_ACCEPT) {
                validationFunctions = this.validationService.accept(commits[0].commit);
            } else if (commits[0]['validationAction'] == this.ACTION_REJECT) {
                validationFunctions = this.validationService.reject(commits[0].commit);
            } else {
                commits.shift();
                this.validateCommitsRecursively(commits);
                return;
            }
            validationFunctions.subscribe(
                (stResp: any) => {
                    commits.shift();
                    this.validateCommitsRecursively(commits);
                }
            );
        }
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