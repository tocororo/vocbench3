import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";

export class AlertModalData extends BSModalContext {
    /**
     * @param title modal title
     * @param message modal message
     * @param type type of the modal. Determines the style of the message alert.
     *      Available values: "info", "warning", "error"
     */
    constructor(
        public title: string = 'Modal Title',
        public message: string = 'Modal Body!',
        public type: string = 'info'
    ) {
       super(); 
    }
}

@Component({
    selector: "alert-modal",
    templateUrl: "app/src/widget/modal/alertModal/alertModal.html",
})
export class AlertModal implements ModalComponent<AlertModalData> {
    context: AlertModalData;
    
    private headerStyle;
    private msgStyle;
    
    constructor(public dialog: DialogRef<AlertModalData>) {
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
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }

    ok(event) {
        event.stopPropagation();
        this.dialog.close(true);
    }

}