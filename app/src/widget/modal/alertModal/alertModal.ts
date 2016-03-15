import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';

export class AlertModalContent {
    constructor(
        public title: string = 'Modal Title',
        public message: string = 'Modal Body!',
        public type: string = 'info',
        public yesText: string = 'Ok'
    ) {}
}

@Component({
    selector: "alert-modal",
    templateUrl: "app/src/widget/modal/alertModal/alertModal.html",
})
export class AlertModal implements ICustomModalComponent {
    dialog: ModalDialogInstance;
    context: AlertModalContent;
    
    private msgStyle;
    
    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <AlertModalContent>modelContentData;
        
        //based on the modal type set the css style of the message alert
        switch (this.context.type) {
            case "info":
                this.msgStyle = "alert alert-info";
                break;
            case "error":
                this.msgStyle = "alert alert-danger";
                break;
            case "warning":
                this.msgStyle = "alert alert-warning";
                break;                
            default:
                this.msgStyle = "alert alert-info";
                break;
        }
    }

    ok(event) {
        event.stopPropagation();
        this.dialog.close(true);
    }

}