import { Component } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { CustomFormsServices } from "../../services/customFormsServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrokenCFStructure } from "../../models/CustomForms";

@Component({
    selector: "broken-cfs-report-modal",
    templateUrl: "./brokenCFStructReportModal.html",
})
export class BrokenCFStructReportModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private brokenCFS: BrokenCFStructure[];

    constructor(public dialog: DialogRef<BSModalContext>, private cfService: CustomFormsServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.cfService.getBrokenCustomForms().subscribe(
            brokenCFS => {
                this.brokenCFS = brokenCFS;
            }
        );
    }

    ok(event: Event) {
        event.stopPropagation();
        this.dialog.close();
    }

}