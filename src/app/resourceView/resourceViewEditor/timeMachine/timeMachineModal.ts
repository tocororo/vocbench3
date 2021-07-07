import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from "src/app/models/ARTResources";
import { UIUtils } from "src/app/utils/UIUtils";

@Component({
    selector: "time-machine-modal",
    templateUrl: "./timeMachineModal.html",
})
export class TimeMachineModal {
    @Input() resource: ARTURIResource; //time machine only available for IRI

    timeNow: string;
    timePrevious: string;
    timePreviousSupport: string; //see onDateTimeChange for details
    invalidFormat: boolean;

    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {
    }

    ngOnInit() {
        let nowDatetime: string = this.toDatetimePickerFormat(new Date());
        this.timeNow = nowDatetime;
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    private toDatetimePickerFormat(date: Date) {
        let yyyy: string = date.getFullYear() + "";
        let MM: string = date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth() + "";
        let dd: string = date.getDate() < 10 ? "0" + date.getDate() : date.getDate() + "";
        let hh: string = date.getHours() < 10 ? "0" + date.getHours() : date.getHours() + "";
        let mm: string = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes() + "";
        let ss: string = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds() + "";
        return yyyy + "-" + MM + "-" + dd + "T" + hh + ":" + mm + ":" + ss;
    }

    /**
     * (at 2021-07-07) datetime-local is not supported in Firefox, so the variable bound to the
     * datetime-local input is timePreviousSupport which, when changes, is matched with the
     * yyyy-MM-ddThh:mm:ss format in order to check if it is a valid datetime.
     * In case the match is passed, timePreviousSupport is assigned to the actual variable timePrevious.
     * Note: in case input datetime-local is supported, timePreviousSupport will always be assigned to timePrevious,
     * moreover the check could be unnecessary since the format is granted by the same input widget
     */
    onDatetimeChange() {
        this.timePreviousSupport = this.timePreviousSupport.trim();
        let regexp = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;
        let matchArray: RegExpExecArray = regexp.exec(this.timePreviousSupport);
        if (matchArray != null) { //if parsed successfully check if it is a valid date
            let yyyy = matchArray[1]; //no range-check on year
            let MM: number = parseInt(matchArray[2]);
            let dd: number = parseInt(matchArray[3]);
            let hh: number = parseInt(matchArray[4]);
            let mm: number = parseInt(matchArray[5]);
            let ss: number = parseInt(matchArray[6]);
            if ((MM >= 0 && MM <= 12) && (dd >= 1 && dd <= 31) && (hh >= 0 && hh <= 24) && (mm >= 0 && mm <= 60) && (ss >= 0 && ss <= 60)) {
                this.timePrevious = this.timePreviousSupport;
                this.invalidFormat = false;
            } else {
                this.invalidFormat = true;
            }
        } else {
            this.invalidFormat = true;
        }
    }

    ok() {
        this.activeModal.close();
    }

}