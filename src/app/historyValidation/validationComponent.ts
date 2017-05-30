import { Component } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { CommitDeltaModal, CommitDeltaModalData } from "./commitDeltaModal";
import { ValidationServices } from "../services/validationServices";
import { CommitInfo } from "../models/History";
import { ARTURIResource } from "../models/ARTResources";
import { UIUtils } from "../utils/UIUtils";

@Component({
    selector: "validation-component",
    templateUrl: "./validationComponent.html",
    host: { class: "pageComponent" }
})
export class ValidationComponent {

    private commits: CommitInfo[];
    private hasNext: boolean = false;

    private ACTION_ACCEPT = { value: "accept", show: "Accept" };
    private ACTION_REJECT = { value: "reject", show: "Reject" };
    private validationActions: { value: string, show: string }[] = [
        { value: null, show: "------" },
        this.ACTION_ACCEPT,
        this.ACTION_REJECT
    ];

    constructor(private validationService: ValidationServices, private modal: Modal) { }

    ngOnInit() {
        this.listStagedCommits(null);
    }

    private listStagedCommits(parentCommit?: ARTURIResource) {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.validationService.getStagedCommits().subscribe(
            commits => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.commits = commits.items;
                this.hasNext = commits.next;
            }
        );
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

    private getPreviousCommits() {

    }

    private getNextCommits() {
        this.listStagedCommits(this.commits[this.commits.length - 1].commit);
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
                this.listStagedCommits(null);
            }
        );
    }

}