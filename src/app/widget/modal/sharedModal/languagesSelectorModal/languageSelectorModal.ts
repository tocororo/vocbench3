import { Component } from "@angular/core";
import { forEach } from "@angular/router/src/utils/collection";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Language, Languages } from "../../../../models/LanguagesCountries";
import { ProjectContext, VBContext } from "../../../../utils/VBContext";

export class LanguageSelectorModalData extends BSModalContext {
    /**
     * @param languages languages selected
     * @param projectAware if true, restrict the languages only to the available in the current project
     * @param radio if true, exactly one language should be selected
     */
    constructor(public title: string, public languages: string[] = [], public projectAware: boolean = false, public projectCtx: ProjectContext, public radio: boolean) {
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

    constructor(public dialog: DialogRef<LanguageSelectorModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        let languages: Language[];
        this.languageItems = [];
        if (this.context.projectAware) {
            languages = VBContext.getWorkingProjectCtx(this.context.projectCtx).getProjectSettings().projectLanguagesSetting;
        } else {
            languages = Languages.getSystemLanguages();
        }

        let initiallySelectedLanguages = this.context.languages;
        if (this.context.radio && initiallySelectedLanguages.length > 1) {
            initiallySelectedLanguages = initiallySelectedLanguages.slice(0, 1); // in case of radio behavior, only consider the first selected language
        }

        for (var i = 0; i < languages.length; i++) {
            this.languageItems.push({
                lang: languages[i], 
                selected: initiallySelectedLanguages.indexOf(languages[i].tag) != -1
            });
        }
    }

    private updateRadioSelection(langTag: string) {
        for (let item of this.languageItems) {
            if (item.lang.tag == langTag) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        }
    }

    private okDisabled(): boolean {
        return this.context.radio && !this.languageItems.some(l => l.selected);
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