import { Component } from "@angular/core";
import { Theme, UIUtils } from "../utils/UIUtils";
import { VBProperties } from "../utils/VBProperties";

@Component({
    selector: "vb-preferences-component",
    templateUrl: "./vocbenchPreferencesComponent.html",
    host: { class: "pageComponent" }
})
export class VocbenchPreferencesComponent {

    private showFlags: boolean;
    private showInstNumb: boolean;
    private themes: Theme[] = UIUtils.themes;
    private selectedTheme: Theme = this.themes[0];

    constructor(private properties: VBProperties) { }

    ngOnInit() {
        //no need to call the service to get the following preferences, since they are already initialized when user accessed the project
        this.showFlags = this.properties.getShowFlags()
        this.showInstNumb = this.properties.getShowInstancesNumber();
        let projThemePref = this.properties.getProjectTheme();
        this.themes.forEach(t => {
            if (t.id == projThemePref) { this.selectedTheme = t; }
        });
    }

    //show flags handlers

    private onShowFlagChange() {
        this.properties.setShowFlags(this.showFlags);
    }

    //show instance number handlers

    private onShowInstNumbChange() {
        this.properties.setShowInstancesNumber(this.showInstNumb);
    }

    //theme handler
    private changeTheme(theme: Theme) {
        this.selectedTheme = theme;
        this.properties.setProjectTheme(this.selectedTheme.id);
    }

}