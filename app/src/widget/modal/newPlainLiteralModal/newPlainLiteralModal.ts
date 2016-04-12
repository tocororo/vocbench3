import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';

export class NewPlainLiteralModalContent {
    /**
     * @param title the title of the modal dialog
     * @param lang the language selected as default
     * @param langReadonly if true the language selection is disable and language cannot be changed
     */
    constructor(
        public title: string = 'Create new label',
        public lang: string = 'en',
        public langReadonly: boolean = false
    ) {}
}

@Component({
    selector: "new-plain-literal-modal",
    templateUrl: "app/src/widget/modal/newPlainLiteralModal/newPlainLiteralModal.html",
})
export class NewPlainLiteralModal implements ICustomModalComponent {
    
    private submitted: boolean = false;
    
    private literal: string;
    private lang: string;
    private languageList = ["ar", "cs", "de", "el", "en", "es", "fr",
        "hi", "it", "ja", "ko", "nl", "pt", "ru", "th", "tr", "uk", "zh"];
    
    dialog: ModalDialogInstance;
    context: NewPlainLiteralModalContent;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <NewPlainLiteralModalContent>modelContentData;
        this.lang = this.context.lang;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }

    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close({value: this.literal, lang: this.lang});
    }

    cancel() {
        this.dialog.dismiss();
    }
    
    private onKeydown(event) {
        if (event.which == "13") {
            this.submitted = true;
            if (this.isInputValid()) {
                this.ok(event);
            }
        }
    }
    
    private isInputValid(): boolean {
        return (this.literal != undefined && this.literal.trim() != "");
    }
    
    private getFlagImgSrc(): string {
        return "app/assets/images/flags/flag_" + this.lang + ".png";
    }

}