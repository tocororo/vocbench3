import { Component } from '@angular/core';
import { DialogRef } from 'ngx-modialog';
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';

@Component({
    selector: 'helper-modal',
    templateUrl: "helperModal.html",
    styleUrls: ["./helperModal.css"]
})

export class HelperModal {
    context: BSModalContext;

    constructor(public dialog: DialogRef<BSModalContext>) {}

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}