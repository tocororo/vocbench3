import { Component } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { CommitInfo } from "../models/History";
import { ValidationServices } from "../services/validationServices";
import { UIUtils } from "../utils/UIUtils";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { AbstractHistValidComponent } from "./abstractHistValidComponent";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ValidationCommentsModal, ValidationCommentsModalData } from "./modals/validationCommentsModal";
import { OverlayConfig } from "ngx-modialog";
import { HistoryValidationModalServices } from "./modals/historyValidationModalServices";

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

    //Attributes that extend the CommitInfo object
    private readonly VALIDATION_ACT_ATTR: string = "validationAction";
    private readonly COMMENT_ATTR: string = "comment";

    constructor(private validationService: ValidationServices, private basicModals: BasicModalServices, private modal: Modal, 
        sharedModals: SharedModalServices, hvModals: HistoryValidationModalServices) {
        super(sharedModals, hvModals);
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
                this.commits.forEach(c => c[this.VALIDATION_ACT_ATTR] = this.ACTION_NONE);
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
            }
        );
    }

    private editComment(commit: CommitInfo) {
        this.basicModals.prompt("Comment", null, null, commit[this.COMMENT_ATTR]).then(
            comment => {
                commit[this.COMMENT_ATTR] = comment;
            },
            () => {}
        )
    }

    private acceptAll() {
        for (var i = 0; i < this.commits.length; i++) {
            this.commits[i][this.VALIDATION_ACT_ATTR] = this.ACTION_ACCEPT;
        }
    }

    private rejectAll() {
        for (var i = 0; i < this.commits.length; i++) {
            this.commits[i][this.VALIDATION_ACT_ATTR] = this.ACTION_REJECT;
        }
    }

    private validate() {
        let commentableCommits: CommitInfo[] = [];
        this.commits.forEach(c => {
            if (c.commentAllowed && c[this.VALIDATION_ACT_ATTR] == this.ACTION_REJECT) {
                commentableCommits.push(c);
            }
        });
        let notCommentedReject: boolean = false;
        for (let c of commentableCommits) {
            if (c[this.COMMENT_ATTR] == null) {
                notCommentedReject = true;
                break;    
            }
        }
        if (notCommentedReject) {
            this.promptCommentsPreview(commentableCommits).then(
                () => {
                    this.validateImpl();
                },
                () => {}
            );
        } else {
            this.validateImpl();
        }
    }

    private validateImpl() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.validateCommitsRecursively(this.commits.slice());
    }

    private promptCommentsPreview(commits: CommitInfo[]) {
        var modalData = new ValidationCommentsModalData(commits);
        const builder = new BSModalContextBuilder<ValidationCommentsModalData>(
            modalData, undefined, ValidationCommentsModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        return this.modal.open(ValidationCommentsModal, overlayConfig).result;
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

            if (olderCommit[this.VALIDATION_ACT_ATTR] == this.ACTION_ACCEPT) {
                validationFunctions = this.validationService.accept(olderCommit.commit);
            } else if (olderCommit[this.VALIDATION_ACT_ATTR] == this.ACTION_REJECT) {
                let comment: string = olderCommit.commentAllowed ? olderCommit[this.COMMENT_ATTR] : null;
                validationFunctions = this.validationService.reject(olderCommit.commit, comment);
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