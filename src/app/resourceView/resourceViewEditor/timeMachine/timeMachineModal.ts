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
        let now: Date = new Date();
        this.historyDates = [now];
        this.historyService.getTimeOfOrigin(this.resource).subscribe(date => {
            let timeOfOrigin: Date = date;
            this.historyDates.push(timeOfOrigin);
            //add random dates (just for testing purpose, all the dates will be retrieved with a service invocation)
            // for (let i = 0; i < 5; i++) {
            //     this.historyDates.push(new Date(+timeOfOrigin + Math.random() * (now.getTime() - timeOfOrigin.getTime())));
            // }
            this.historyDates.sort((d1, d2) => d1.getTime() - d2.getTime());

            this.dateSlideIdx = this.historyDates.length-1;
            this.updatePreviewedDate();
            this.updateSelectedDate();
        })
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