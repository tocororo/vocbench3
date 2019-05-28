import { Component } from "@angular/core";
import { Language, Languages } from "../../models/LanguagesCountries";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";


@Component({
    selector: "lang-editing-pref",
    templateUrl: "./languageEditingComponent.html"
})
export class LanguageEditingComponent {

    private languages: Language[] = [];
    private editingLang: Language;

    constructor(private properties: VBProperties) { }

    ngOnInit() {
        var userAssignedLangs: string[] = VBContext.getProjectUserBinding().getLanguages();
        this.languages = Languages.fromTagsToLanguages(userAssignedLangs);

        let editingLangTag = VBContext.getWorkingProjectCtx().getProjectPreferences().editingLanguage;
        
        for (var i = 0; i < this.languages.length; i++) {
            if (this.languages[i].tag == editingLangTag) {
                this.editingLang = this.languages[i];
                break;
            }
        }
    }

    private updateDefaultLang(lang: Language) {
        this.editingLang = lang;
        this.properties.setEditingLanguage(this.editingLang.tag);
    }

}