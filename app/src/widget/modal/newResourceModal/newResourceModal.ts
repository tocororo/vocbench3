import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';

export class NewResourceModalContent {
    constructor(public title: string = 'Create new resource') {}
}

@Component({
    selector: "new-resource-modal",
    templateUrl: "app/src/widget/modal/newResourceModal/newResourceModal.html",
})
export class NewResourceModal implements ICustomModalComponent {
    
    private submitted: boolean = false;
    
    private name: string;
    private label: string;
    private lang: string = "en";
    private languageList = ["ar", "cs", "de", "el", "en", "es", "fr",
        "hi", "it", "ja", "ko", "nl", "pt", "ru", "th", "tr", "uk", "zh"];
    
    dialog: ModalDialogInstance;
    context: NewResourceModalContent;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <NewResourceModalContent>modelContentData;
    }

    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close({name: this.name, label: this.label, lang: this.lang});
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
        return (this.name != undefined && this.name.trim() != "");
    }
    
    private getFlagImgSrc(): string {
        return "app/assets/images/flags/flag_" + this.lang + ".png";
    }

}