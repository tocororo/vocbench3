import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Language } from "../../../../models/LanguagesCountries";
import { ProjectContext, VBContext } from "../../../../utils/VBContext";

@Component({
    selector: "lang-selector-modal",
    templateUrl: "./languageSelectorModal.html",
})
export class LanguageSelectorModal {
    @Input() title: string;
    @Input() languages: string[] = [];
    @Input() radio: boolean;
    @Input() projectAware: boolean;
    @Input() projectCtx: ProjectContext;

    languageItems: LanguageItem[];

    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {
        let languages: Language[];
        this.languageItems = [];
        if (this.projectAware) {
            languages = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectSettings().projectLanguagesSetting;
        } else {
            languages = VBContext.getSystemSettings().languages;
        }

        let initiallySelectedLanguages = this.languages;
        if (this.radio && initiallySelectedLanguages.length > 1) {
            initiallySelectedLanguages = initiallySelectedLanguages.slice(0, 1); // in case of radio behavior, only consider the first selected language
        }

        for (let i = 0; i < languages.length; i++) {
            this.languageItems.push({
                lang: languages[i], 
                selected: initiallySelectedLanguages.indexOf(languages[i].tag) != -1
            });
        }
    }

    selectLang(lang: LanguageItem) {
        if (this.radio) {
            this.languageItems.forEach(l => {
                if (l == lang) {
                    l.selected = true;
                } else {
                    l.selected = false;
                }
            });
        } else {
            lang.selected = !lang.selected;
        }
    }

    okDisabled(): boolean {
        return this.radio && !this.languageItems.some(l => l.selected);
    }

    ok() {
        let activeLangs: string[] = [];
        for (let i = 0; i < this.languageItems.length; i++) {
            if (this.languageItems[i].selected) {
                activeLangs.push(this.languageItems[i].lang.tag);
            }
        }
        this.activeModal.close(activeLangs);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

class LanguageItem {
    public lang: Language;
    public selected: boolean;
}