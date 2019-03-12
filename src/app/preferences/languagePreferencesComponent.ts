import { Component } from "@angular/core";

@Component({
    selector: "lang-pref",
    templateUrl: "./languagePreferencesComponent.html"
})
export class LanguagePreferencesComponent {

    private panels: string[] = ["rendering", "editing", "valuefilter"]
    private activePanel: string = this.panels[0];

    constructor() { }

}