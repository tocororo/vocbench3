import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Stringifiable } from "d3";
import { ARTURIResource } from "src/app/models/ARTResources";
import { CommitInfo } from "src/app/models/History";
import { HistoryServices } from "src/app/services/historyServices";
import { UIUtils } from "src/app/utils/UIUtils";

@Component({
    selector: "time-machine-modal",
    templateUrl: "./timeMachineModal.html",
})
export class TimeMachineModal {
    @Input() resource: ARTURIResource; //time machine only available for IRI

    commits: CommitInfo[];
    commitSlideIdx: number;

    sliderCommit: CommitInfo; //commit of the slider during the "sliding" (useful for commit preview during sliding)
    selectedCommit: CommitInfo; //commit selected by the slider (when the slider is released, so not during the sliding)

    constructor(private historyService: HistoryServices, private activeModal: NgbActiveModal, private elementRef: ElementRef) {}

    ngOnInit() {
        this.commits = [];
        this.historyService.getCommitSummary(null, null, null, [this.resource]).subscribe(
            info => {
                this.historyService.getCommits(info.tipRevisionNumber, null, null, null, [this.resource], null, null, null, null, null, 999).subscribe(
                    commits => {
                        this.commits = commits;
                        this.commits.sort((c1, c2) => c1.endTime.getTime() - c2.endTime.getTime());
                    }
                )
            }
        )
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }


    selectCommit(commit: CommitInfo) {
        this.commitSlideIdx = this.commits.findIndex(c => c == commit);
        this.updatePreviewedCommit();
        this.updateSelectedCommit();
    }
    previousCommit() {
        this.commitSlideIdx = this.commitSlideIdx-1;
        this.updatePreviewedCommit();
        this.updateSelectedCommit();
    }
    nextCommit() {
        this.commitSlideIdx = this.commitSlideIdx+1;
        this.updatePreviewedCommit();
        this.updateSelectedCommit();
    }

    /**
     * Update the slider commit during the "sliding" (useful for the preview of the date)
     */
     updatePreviewedCommit() {
        this.sliderCommit = this.commits[this.commitSlideIdx];
    }

    /**
     * Update the selected commit when the slider is left (not during sliding)
     */
    updateSelectedCommit() {
        this.selectedCommit = this.sliderCommit;
    }
    

    ok() {
        this.activeModal.close();
    }

}