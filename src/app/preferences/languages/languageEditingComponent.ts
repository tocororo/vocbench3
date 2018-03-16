import { Component } from "@angular/core";
import { UIUtils } from "../../utils/UIUtils";
import { VBProperties } from "../../utils/VBProperties";
import { VBContext } from "../../utils/VBContext";
import { Language, Languages } from "../../models/LanguagesCountries";
import { Properties } from "../../models/Properties";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";


@Component({
    selector: "lang-editing-pref",
    templateUrl: "./languageEditingComponent.html"
})
export class LanguageEditingComponent {

    private languages: Language[] = [];
    private editingLang: Language;

    constructor(private properties: VBProperties, private prefSettingService: PreferencesSettingsServices) { }

    ngOnInit() {
        var userAssignedLangs: string[] = VBContext.getProjectUserBinding().getLanguages();
        this.languages = Languages.fromTagsToLanguages(userAssignedLangs);

        let editingLangTag = this.properties.getEditingLanguage();
        
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