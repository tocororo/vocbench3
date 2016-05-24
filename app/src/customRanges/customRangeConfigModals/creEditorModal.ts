import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";

/**
 * Useless class with empty data
 * (I need this cause currently I don't know how to create a Custom Modal without context data)
 */
export class CustomRangeEntryEditorModalData extends BSModalContext {
    constructor() {
        super();
    }
}

@Component({
    selector: "cre-editor-modal",
    templateUrl: "app/src/customRanges/customRangeConfigModals/creEditorModal.html",
})
export class CustomRangeEntryEditorModal implements ModalComponent<BSModalContext> {
    context: CustomRangeEntryEditorModalData;
    
    constructor(public dialog: DialogRef<CustomRangeEntryEditorModalData>) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }
    
    ok(event) {
        event.stopPropagation();
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }
}