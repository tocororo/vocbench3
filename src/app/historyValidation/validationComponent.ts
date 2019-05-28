import { Component } from "@angular/core";
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { CommitInfo } from "../models/History";
import { ValidationServices } from "../services/validationServices";
import { UIUtils } from "../utils/UIUtils";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { AbstractHistValidComponent } from "./abstractHistValidComponent";

@Component({
    selector: "validation-component",
    templateUrl: "./validationComponent.html",
    host: { class: "pageComponent" }
})
export class ValidationComponent extends AbstractHistValidComponent {

    //paging
    private tipTime: string;

    private ACTION_ACCEPT = { value: "accept", show: "Accept" };
    private ACTION_REJECT = { value: "reject", show: "Reject" };
    private ACTION_NONE = { value: "------", show: "------" };
    private validationActions: { value: string, show: string }[] = [
        this.ACTION_NONE,
        this.ACTION_ACCEPT,
        this.ACTION_REJECT
    ];

    constructor(private validationService: ValidationServices, sharedModals: SharedModalServices, modal: Modal) {
        super(sharedModals, modal);
    }

    init() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.page = 0;
        this.commits = [];
        this.validationService.getStagedCommitSummary(this.operations, this.getPerformersIRI(), this.getFormattedFromTime(), this.getFormattedToTime(), this.limit).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.pageCount = stResp.pageCount;
                this.tipTime = stResp.tipTime;
                if (this.tipTime != null) {
                    this.listCommits();
                }
            }
        );
    }

    listCommits() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        let timeUpperBound: string = this.getFormattedToTime();
        if (timeUpperBound == null) {
            timeUpperBound = this.tipTime;
        }
        this.validationService.getCommits(this.operations, this.getPerformersIRI(), timeUpperBound, this.getFormattedFromTime(), 
            this.operationSorting, this.timeSorting, this.page, this.limit).subscribe(
            commits => {
                this.commits = commits;
                this.commits.forEach(c => c['validationAction'] = this.ACTION_NONE);
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
            }
        );
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
            //Iterate over commits (from the oldest to the most recent) validate (accept/reject) them

            //get older commit
            let olderCommit: CommitInfo = commits[0];
            for (var i = 1; i < commits.length; i++) {
                if (commits[i].endTime < olderCommit.endTime) {
                    olderCommit = commits[i];
                }
            }

            if (olderCommit['validationAction'] == this.ACTION_ACCEPT) {
                validationFunctions = this.validationService.accept(olderCommit.commit);
            } else if (olderCommit['validationAction'] == this.ACTION_REJECT) {
                validationFunctions = this.validationService.reject(olderCommit.commit);
            } else {
                commits.splice(commits.indexOf(olderCommit), 1);
                this.validateCommitsRecursively(commits);
                return;
            }
            validationFunctions.subscribe(
                (stResp: any) => {
                    commits.splice(commits.indexOf(olderCommit), 1);
                    this.validateCommitsRecursively(commits);
                }
            );
        }
    }

}