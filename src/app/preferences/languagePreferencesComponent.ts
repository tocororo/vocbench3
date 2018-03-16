import { Component } from "@angular/core";
import { UIUtils } from "../utils/UIUtils";
import { VBProperties } from "../utils/VBProperties";
import { Language } from "../models/LanguagesCountries";
import { Properties } from "../models/Properties";
import { PreferencesSettingsServices } from "../services/preferencesSettingsServices";

@Component({
    selector: "lang-pref",
    templateUrl: "./languagePreferencesComponent.html"
})
export class LanguagePreferencesComponent {

    private panels: string[] = ["rendering", "editing"]
    private activePanel: string = this.panels[0];

    constructor() { }

}