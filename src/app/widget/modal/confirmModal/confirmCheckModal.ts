import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";

export class ConfirmCheckModalData extends BSModalContext {
    /**
     * @param title modal title
     * @param message modal message
     * @param checkboxLabel label of the checkbox
     * @param type type of the modal. Determines the style of the message alert.
     *      Available values: "info", "warning", "error"
     * @param yesText text of the yes button
     * @param noText text of the no button
     */
    constructor(
        public title: string = 'Modal Title',
        public message: string = 'Modal Body!',
        public checkboxLabel: string = 'Label check',
        public type: string = 'info',
        public yesText: string = 'Yes',
        public noText: string = 'No'
    ) {
        super();
        this.keyboard = null;
    }
}

@Component({
    selector: "confirm-modal",
    templateUrl: "./confirmCheckModal.html",
})
export class ConfirmCheckModal implements ModalComponent<ConfirmCheckModalData> {
	context: ConfirmCheckModalData;
    
    private check: boolean = false;
    
    private headerStyle;
    private msgStyle;

    constructor(public dialog: DialogRef<ConfirmCheckModalData>) {
        this.context = dialog.context;
        
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
    
    ok(event) {
        this.dialog.close(this.check);
    }

    cancel() {
        this.dialog.dismiss();
    }
}