import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';

export class AlertModalContent {
    public title: string = 'Modal Title';
    public message: string = 'Modal Body!';
    public type: string = 'info';
    /**
     * @param title modal title
     * @param message modal message
     * @param type type of the modal. Determines the style of the message alert.
     *      Available values: "info", "warning", "error"
     */
    constructor(title: string, message: string, type: string) {
        this.title = title;
        this.message = message;
        this.type = type;
    }
}

@Component({
    selector: "alert-modal",
    templateUrl: "app/src/widget/modal/alertModal/alertModal.html",
})
export class AlertModal implements ICustomModalComponent {
    dialog: ModalDialogInstance;
    context: AlertModalContent;
    
    private headerStyle;
    private msgStyle;
    
    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <AlertModalContent>modelContentData;
        
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