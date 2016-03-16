import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';

export class NewLiteralLangModalContent {
    constructor(public title: string = 'Create new label') {}
}

@Component({
    selector: "new-label-modal",
    templateUrl: "app/src/widget/modal/newLiteralLangModal/newLiteralLangModal.html",
})
export class NewLiteralLangModal implements ICustomModalComponent {
    
    private submitted: boolean = false;
    
    private label: string;
    private lang: string = "en";
    private languageList = ["ar", "cs", "de", "el", "en", "es", "fr",
        "hi", "it", "ja", "ko", "nl", "pt", "ru", "th", "tr", "uk", "zh"];
    
    dialog: ModalDialogInstance;
    context: NewLiteralLangModalContent;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <NewLiteralLangModalContent>modelContentData;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }

    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close({label: this.label, lang: this.lang});
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
        return (this.label != undefined && this.label.trim() != "");
    }
    
    private getFlagImgSrc(): string {
        return "app/assets/images/flags/flag_" + this.lang + ".png";
    }

}