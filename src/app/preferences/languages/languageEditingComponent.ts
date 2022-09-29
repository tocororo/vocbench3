import { Component } from "@angular/core";
import { Language, Languages } from "../../models/LanguagesCountries";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";


@Component({
    selector: "lang-editing-pref",
    templateUrl: "./languageEditingComponent.html"
})
export class LanguageEditingComponent {

    languages: Language[] = [];
    private editingLang: Language;

    constructor(private properties: VBProperties) { }

    ngOnInit() {
        let userAssignedLangs: string[] = VBContext.getProjectUserBinding().getLanguages();
        if (userAssignedLangs.length == 0 && VBContext.getLoggedUser().isAdmin()) { //admin with no lang assigned => implicitly set all project langs
            this.languages = VBContext.getWorkingProjectCtx().getProjectSettings().projectLanguagesSetting;
        } else {
            this.languages = Languages.fromTagsToLanguages(userAssignedLangs);
        }

        //init the chosen default editing language
        let editingLangTag = VBContext.getWorkingProjectCtx().getProjectPreferences().editingLanguage;
        this.editingLang = this.languages.find(l => l.tag == editingLangTag);
    }

    updateDefaultLang(lang: Language) {
        this.editingLang = lang;
        this.properties.setEditingLanguage(this.editingLang.tag).subscribe();
    }

}