import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Stringifiable } from "d3";
import { ARTURIResource } from "src/app/models/ARTResources";
import { HistoryServices } from "src/app/services/historyServices";
import { UIUtils } from "src/app/utils/UIUtils";

@Component({
    selector: "time-machine-modal",
    templateUrl: "./timeMachineModal.html",
})
export class TimeMachineModal {
    @Input() resource: ARTURIResource; //time machine only available for IRI

    historyDates: Date[];
    dateSlideIdx: number;
    sliderDate: Date;
    selectedDate: string;

    constructor(private historyService: HistoryServices, private activeModal: NgbActiveModal, private elementRef: ElementRef) {
    }

    ngOnInit() {
        this.historyDates = [];
        this.historyService.getCommitSummary(null, null, null, [this.resource]).subscribe(
            info => {
                this.historyService.getCommits(info.tipRevisionNumber, null, null, null, [this.resource], null, null, null, null, null, 999).subscribe(
                    commits => {
                        commits.forEach(c => {
                            this.historyDates.push(c.endTime);
                        });
                        this.historyDates.sort((d1, d2) => d1.getTime() - d2.getTime());
                    }
                )
            }
        )
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    selectDate(date: Date) {
        this.dateSlideIdx = this.historyDates.findIndex(d => d == date);
        this.updatePreviewedDate();
        this.updateSelectedDate();
    }

    previousDate() {
        this.dateSlideIdx = this.dateSlideIdx-1;
        this.updatePreviewedDate();
        this.updateSelectedDate();
    }
    nextDate() {
        this.dateSlideIdx = this.dateSlideIdx+1;
        this.updatePreviewedDate();
        this.updateSelectedDate();
    }

    /**
     * Update the slider date during the "sliding" (useful for the preview of the date)
     */
    updatePreviewedDate() {
        this.sliderDate = this.historyDates[this.dateSlideIdx];
    }

    /**
     * Update the selected date when the slider is left (not during sliding)
     */
    updateSelectedDate() {
        this.selectedDate = this.sliderDate.toISOString();
    }

    ok() {
        this.activeModal.close();
    }

}