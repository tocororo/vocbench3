import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";

export class SelectionModalData extends BSModalContext {
    /**
     * @param title modal title
     * @param message modal message, if null no the message is shwown the modal
     * @param options options available
     */
    constructor(
        public title: string = 'Modal Title',
        public message: string,
        public options: Array<string>
    ) {
        super();
    }
}

/**
 * Modal that allows to choose among a set of options
 */
@Component({
    selector: "selection-modal",
    templateUrl: "app/src/widget/modal/selectionModal/selectionModal.html",
})
export class SelectionModal implements ModalComponent<SelectionModalData> {
    context: SelectionModalData;
    
    private optionSelected;
    
    constructor(public dialog: DialogRef<SelectionModalData>) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }

    ok(event) {
        event.stopPropagation();
        this.dialog.close(this.optionSelected);
    }

    cancel() {
        this.dialog.dismiss();
    }
}