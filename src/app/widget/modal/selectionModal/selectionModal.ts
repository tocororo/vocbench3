import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";

export class SelectionModalData extends BSModalContext {
    /**
     * @param title modal title
     * @param message modal message, if null no the message is shwown the modal
     * @param options array of options. This can be an array of string or an array of objects 
     * {value: string, description: string}, where the description is shown on mouseover of the option value
     * @param optionsWithDescription if true the options array is treated as an array of objects,
     * otherwise it is a simple string array 
     */
    constructor(
        public title: string = 'Modal Title',
        public message: string,
        public options: Array<any>,
        public optionsWithDescription?: boolean
    ) {
        super();
        this.keyboard = null;
    }
}

/**
 * Modal that allows to choose among a set of options
 */
@Component({
    selector: "selection-modal",
    templateUrl: "./selectionModal.html",
})
export class SelectionModal implements ModalComponent<SelectionModalData> {
    context: SelectionModalData;
    
    private optionSelected;
    
    constructor(public dialog: DialogRef<SelectionModalData>) {
        this.context = dialog.context;
    }

    ok(event) {
        event.stopPropagation();
        this.dialog.close(this.optionSelected);
    }

    cancel() {
        this.dialog.dismiss();
    }
}