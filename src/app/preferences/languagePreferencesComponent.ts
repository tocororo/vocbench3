import { Component } from "@angular/core";

@Component({
    selector: "lang-pref",
    templateUrl: "./languagePreferencesComponent.html"
})
export class LanguagePreferencesComponent {

    private panels: string[] = ["rendering", "editing", "valuefilter"];
    activePanel: string = this.panels[0];

    constructor() { }

}