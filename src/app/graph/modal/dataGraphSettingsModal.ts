import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';

@Component({
    selector: "data-graph-settings-modal",
    templateUrl: "./dataGraphSettingsModal.html",
})
export class DataGraphSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    constructor(public dialog: DialogRef<BSModalContext>) {
        this.context = dialog.context;
    }

    ngOnInit() {
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}