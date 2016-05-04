import {Component} from "@angular/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';

export class SelectionModalContent {
    public title: string = 'Modal Title';
    public message: string;
    public options: Array<string>;
    /**
     * @param title modal title
     * @param message modal message, if null no the message is shwown the modal
     * @param options options available
     */
    constructor(title: string,  message: string, options: Array<string>) {
        this.title = title;
        this.message = message;
        this.options = options;
    }
}

/**
 * Modal that allows to choose among a set of options
 */
@Component({
    selector: "selection-modal",
    templateUrl: "app/src/widget/modal/selectionModal/selectionModal.html",
})
export class SelectionModal implements ICustomModalComponent {
    
    private optionSelected;
    
    dialog: ModalDialogInstance;
    context: SelectionModalContent;
    
    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <SelectionModalContent>modelContentData;
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