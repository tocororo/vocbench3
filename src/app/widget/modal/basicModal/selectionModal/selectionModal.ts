import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ModalType } from "../basicModalServices";

export class SelectionModalData extends BSModalContext {
    /**
     * @param title modal title
     * @param message modal message, if null no the message is shwown the modal
     * @param options array of options. This can be an array of string or an array of objects 
     * {value: string, description: string}, where the description is shown on mouseover of the option value
     */
    constructor(
        public title: string = 'Modal Title',
        public message: string,
        public options: Array<string | SelectionOption>,
        public type: ModalType = 'info',
    ) {
        super();
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

    private headerStyle: string;
    private msgStyle: string;
    
    private optionsWithDescription: boolean; //tells if the option list contains complext object
    private optionSelected: any; //string or {string, string} object, according the input options list
    private size: number;
    
    constructor(public dialog: DialogRef<SelectionModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.size = 20; //max size of the select element
        if (this.context.options.length < this.size) {
            this.size = this.context.options.length;
        }

        this.optionsWithDescription = (this.context.options.length > 0 && typeof this.context.options[0] == "object");

        //based on the modal type set the css style of the message alert
        switch (this.context.type) {
            case "info":
                this.msgStyle = "alert alert-info";
                this.headerStyle = "modal-title text-info";
                break;
            case "error":
                this.msgStyle = "alert alert-danger";
                this.headerStyle = "modal-title text-danger";
                break;
            case "warning":
                this.msgStyle = "alert alert-warning";
                this.headerStyle = "modal-title text-warning";
                break;
            default:
                this.msgStyle = "alert alert-info";
                this.headerStyle = "modal-title text-info";
                break;
        }
    }

    ok(event: Event) {
        event.stopPropagation();
        this.dialog.close(this.optionSelected);
    }

    cancel() {
        this.dialog.dismiss();
    }
}

export class SelectionOption {
    value: string;
    description: string;
}