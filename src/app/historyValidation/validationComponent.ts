import { Component } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from "rxjs";
import { CommitInfo } from "../models/History";
import { ValidationServices } from "../services/validationServices";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { UIUtils } from "../utils/UIUtils";
import { VBActionsEnum } from "../utils/VBActions";
import { VBEventHandler } from "../utils/VBEventHandler";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalOptions } from '../widget/modal/Modals';
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { AbstractHistValidComponent } from "./abstractHistValidComponent";
import { HistoryValidationModalServices } from "./modals/historyValidationModalServices";
import { ValidationCommentsModal } from "./modals/validationCommentsModal";

@Component({
    selector: "validation-component",
    templateUrl: "./validationComponent.html",
    host: { class: "pageComponent" }
})
export class ValidationComponent extends AbstractHistValidComponent {

    isValidator: boolean; //useful to determine if it needs to list all commits (for validator) or only those of the current user

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

    constructor(private validationService: ValidationServices, private basicModals: BasicModalServices, private modalService: NgbModal, 
        sharedModals: SharedModalServices, hvModals: HistoryValidationModalServices, eventHandler: VBEventHandler) {
        super(sharedModals, hvModals, eventHandler);
    }

    ngOnInit() {
        this.isValidator = AuthorizationEvaluator.isAuthorized(VBActionsEnum.validation);
        
        //init available actions: validator can accept and reject, not validator can only reject its actions
        if (this.isValidator) {
            this.validationActions = [ this.ACTION_NONE, this.ACTION_ACCEPT, this.ACTION_REJECT ];
        } else {
            this.validationActions = [ this.ACTION_NONE, this.ACTION_REJECT ];
        }
        
        this.init();
    }

    init() {
        this.page = 0;
        this.commits = [];

        let getCommitSummaryFn: Observable<any>;
        if (this.isValidator) { //validator can see the commits of all the users
            getCommitSummaryFn = this.validationService.getStagedCommitSummary(this.operations, this.getPerformersIRI(), 
                this.getFormattedFromTime(), this.getFormattedToTime(), this.limit);
        } else { //not validator can see only its commits
            getCommitSummaryFn = this.validationService.getCurrentUserStagedCommitSummary(this.operations,
                this.getFormattedFromTime(), this.getFormattedToTime(), this.limit);
        }

        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        getCommitSummaryFn.subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.pageCount = stResp.pageCount;
                this.pageSelector = [];
                for (let i = 0; i < this.pageCount; i++) {
                    this.pageSelector.push(i);
                }
                this.tipTime = stResp.tipTime;
                if (this.tipTime != null) {
                    this.listCommits();
                }
            }
        );
    }

    listCommits() {
        let timeUpperBound: string = this.getFormattedToTime();
        if (timeUpperBound == null) {
            timeUpperBound = this.tipTime;
        }

        let getCommitsFn: Observable<CommitInfo[]>;
        if (this.isValidator) { //validator can see the commits of all the users
            getCommitsFn = this.validationService.getCommits(this.operations, this.getPerformersIRI(), 
                timeUpperBound, this.getFormattedFromTime(), this.operationSorting.id, this.timeSorting.id, this.page, this.limit);
        } else { //not validator can see only its commits
            getCommitsFn = this.validationService.getCurrentUserCommits(this.operations, 
                timeUpperBound, this.getFormattedFromTime(), this.operationSorting.id, this.timeSorting.id, this.page, this.limit);
        }

        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        getCommitsFn.subscribe(
            commits => {
                this.commits = commits;
                this.commits.forEach(c => c[this.VALIDATION_ACT_ATTR] = this.ACTION_NONE);
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
            }
        );
    }

    private editComment(commit: CommitInfo) {
        this.basicModals.prompt({key:"ACTIONS.COMMENT"}, null, null, commit[this.COMMENT_ATTR]).then(
            comment => {
                commit[this.COMMENT_ATTR] = comment;
            },
            () => {}
        )
    }

    acceptAll() {
        for (var i = 0; i < this.commits.length; i++) {
            this.commits[i][this.VALIDATION_ACT_ATTR] = this.ACTION_ACCEPT;
        }
    }

    rejectAll() {
        for (var i = 0; i < this.commits.length; i++) {
            this.commits[i][this.VALIDATION_ACT_ATTR] = this.ACTION_REJECT;
        }
    }

    validate() {
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
        const modalRef: NgbModalRef = this.modalService.open(ValidationCommentsModal, new ModalOptions('lg'));
        modalRef.componentInstance.commitsInput = commits;
        return modalRef.result;
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
                if (this.isValidator) {
                    validationFunctions = this.validationService.reject(olderCommit.commit, comment);    
                } else {
                    validationFunctions = this.validationService.rejectCurrentUserCommit(olderCommit.commit, comment);    
                }
            } else {
                commits.splice(commits.indexOf(olderCommit), 1);
                this.validateCommitsRecursively(commits);
                return;
            }
            validationFunctions.subscribe(
                () => {
                    commits.splice(commits.indexOf(olderCommit), 1);
                    this.validateCommitsRecursively(commits);
                }
            );
        }
    }

}