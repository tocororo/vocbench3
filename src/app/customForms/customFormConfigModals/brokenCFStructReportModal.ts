import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { BrokenCFStructure } from "../../models/CustomForms";
import { CustomFormsServices } from "../../services/customFormsServices";

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