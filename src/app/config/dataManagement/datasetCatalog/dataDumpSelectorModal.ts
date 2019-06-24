import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DownloadDescription } from "../../../models/Metadata";

export class DataDumpSelectorModalData extends BSModalContext {
    constructor(public message: string, public dataDumps: DownloadDescription[]) {
        super();
    }
}

@Component({
    selector: "data-dump-selector-modal",
    templateUrl: "./dataDumpSelectorModal.html"
})
export class DataDumpSelectorModal implements ModalComponent<DataDumpSelectorModalData> {
    context: DataDumpSelectorModalData;

    private selectedDump: DownloadDescription;

    constructor(public dialog: DialogRef<DataDumpSelectorModalData>) {
        this.context = dialog.context;
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedDump);
    }

    cancel() {
        this.dialog.dismiss();
    }

}