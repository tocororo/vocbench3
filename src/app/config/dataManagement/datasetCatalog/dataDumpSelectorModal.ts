import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DownloadDescription } from "../../../models/Metadata";

@Component({
    selector: "data-dump-selector-modal",
    templateUrl: "./dataDumpSelectorModal.html"
})
export class DataDumpSelectorModal {
    @Input() message: string;
    @Input() dataDumps: DownloadDescription[];

    selectedDump: DownloadDescription;

    constructor(public activeModal: NgbActiveModal) {}

    ok() {
        this.activeModal.close(this.selectedDump);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}