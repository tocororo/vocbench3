import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { Language, Languages } from "../../../../models/LanguagesCountries";

export class LanguageSelectorModalData extends BSModalContext {
    /**
     * @param languages languages selected
     */
    constructor(public title: string, public languages: string[] = []) {
        super();
    }
}

@Component({
    selector: "lang-selector-modal",
    templateUrl: "./languageSelectorModal.html",
})
export class LanguageSelectorModal implements ModalComponent<LanguageSelectorModalData> {
    context: LanguageSelectorModalData;

    private languageItems: LanguageItem[];

    constructor(public dialog: DialogRef<LanguageSelectorModalData>, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        let systemLanguages: Language[] = Languages.getSystemLanguages();
        this.languageItems = [];
        for (var i = 0; i < systemLanguages.length; i++) {
            this.languageItems.push({
                lang: systemLanguages[i], 
                selected: this.context.languages.indexOf(systemLanguages[i].tag) != -1
            });
        }
    }

    ok(event: Event) {
        var activeLangs: string[] = [];
        for (var i = 0; i < this.languageItems.length; i++) {
            if (this.languageItems[i].selected) {
                activeLangs.push(this.languageItems[i].lang.tag);
            }
        }
        event.stopPropagation();
        this.dialog.close(activeLangs);
    }

    cancel() {
        this.dialog.dismiss();
    }

}

class LanguageItem {
    public lang: Language;
    public selected: boolean;
}