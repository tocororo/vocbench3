import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';

export class PromptModalContent {
    constructor(
        public title: string = 'Modal Title',
        public label: string = 'Modal Body!',
        public hideNo: boolean = false,
        public yesText: string = 'Ok',
        public noText: string = 'Cancel',
        public inputOptional: boolean = false
    ) {}
}

@Component({
    selector: "prompt-modal",
    templateUrl: "app/src/widget/modal/promptModal/promptModal.html",
})
export class PromptModal implements ICustomModalComponent {
    
    private inputTxt: string;
    
    dialog: ModalDialogInstance;
    context: PromptModalContent;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <PromptModalContent>modelContentData;
    }

    ok(event) {
        event.stopPropagation();
        this.dialog.close(this.inputTxt);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
    private onKeypress(event) {
        if (event.keyIdentifier == "Enter") {
            this.ok(event);
        }
    }
    
    private isOkDisabled(): boolean {
        return (!this.context.inputOptional && (this.inputTxt == undefined || this.inputTxt.trim() == ""));
    }

}