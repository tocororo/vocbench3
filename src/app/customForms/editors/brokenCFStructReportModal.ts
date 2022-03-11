import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BrokenCFStructure } from "../../models/CustomForms";
import { CustomFormsServices } from "../../services/customFormsServices";

@Component({
    selector: "broken-cfs-report-modal",
    templateUrl: "./brokenCFStructReportModal.html",
})
export class BrokenCFStructReportModal {

    brokenCFS: BrokenCFStructure[];

    constructor(public activeModal: NgbActiveModal, private cfService: CustomFormsServices) {}

    ngOnInit() {
        this.cfService.getBrokenCustomForms().subscribe(
            brokenCFS => {
                this.brokenCFS = brokenCFS;
            }
        );
    }

    ok() {
        this.activeModal.close();
    }

}