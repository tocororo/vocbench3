import {Component} from "@angular/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';

export class ConfirmCheckModalContent {
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
    ) {}
}

@Component({
    selector: "confirm-modal",
    templateUrl: "app/src/widget/modal/confirmModal/confirmCheckModal.html",
})
export class ConfirmCheckModal implements ICustomModalComponent {
    dialog: ModalDialogInstance;
    context: ConfirmCheckModalContent;
    
    private check: boolean = false;
    
    private headerStyle;
    private msgStyle;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <ConfirmCheckModalContent>modelContentData;
        
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
        this.dialog.close(this.check);
    }

    cancel() {
        this.dialog.dismiss();
    }
}