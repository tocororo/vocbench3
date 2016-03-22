import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';
import {SanitizerDirective} from "../../../utils/directives/sanitizerDirective";

export class PromptModalContent {
    public title: string = "Modal Title";
    public label: string;
    public hideNo: boolean = false;
    public inputOptional: boolean = false;
    public inputSanitized: boolean = false;
    /**
     * @param title modal title
     * @param label label of the input field
     * @param hideNo tells if the no button should be hide
     * @param inputOptional tells if the input field is optional or mandatory
     * @param inputSanitized tells if the input field should be sanitized
     */
    constructor(title: string, label: string, hideNo: boolean, inputOptional: boolean, inputSanitized: boolean) {
        this.title = title;
        this.label = label;
        this.hideNo = hideNo;
        this.inputOptional = inputOptional;
        this.inputSanitized = inputSanitized;
    }
}

@Component({
    selector: "prompt-modal",
    templateUrl: "app/src/widget/modal/promptModal/promptModal.html",
    directives: [SanitizerDirective]
})
export class PromptModal implements ICustomModalComponent {
    
    private inputTxt: string;
    
    private submitted: boolean = false;
    
    dialog: ModalDialogInstance;
    context: PromptModalContent;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <PromptModalContent>modelContentData;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }

    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.inputTxt);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
    private onKeypress(event) {
        if (event.keyIdentifier == "Enter") {
            this.submitted = true;
            if (this.isInputValid()) {
                this.ok(event);
            }
        }
    }
    
    private isInputValid(): boolean {
        return (this.inputTxt != undefined && this.inputTxt.trim() != "");
    }

}