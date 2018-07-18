import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BasicModalServices } from "../../basicModal/basicModalServices";
import { Language, Languages } from "../../../../models/LanguagesCountries";
import { VBProperties } from "../../../../utils/VBProperties";

export class LanguageSelectorModalData extends BSModalContext {
    /**
     * @param languages languages selected
     * @param projectAware if true, restrict the languages only to the available in the current project
     */
    constructor(public title: string, public languages: string[] = [], public projectAware: boolean = false) {
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

    constructor(public dialog: DialogRef<LanguageSelectorModalData>, private vbProp: VBProperties, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        let languages: Language[];
        this.languageItems = [];
        if (this.context.projectAware) {
            languages = this.vbProp.getProjectLanguages();
        } else {
            languages = Languages.getSystemLanguages();
        }
        for (var i = 0; i < languages.length; i++) {
            this.languageItems.push({
                lang: languages[i], 
                selected: this.context.languages.indexOf(languages[i].tag) != -1
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