import { Component } from "@angular/core";
import { Theme, UIUtils } from "../utils/UIUtils";
import { VBContext } from "../utils/VBContext";
import { VBProperties } from "../utils/VBProperties";

@Component({
    selector: "vb-preferences-component",
    templateUrl: "./vocbenchPreferencesComponent.html",
    host: { class: "pageComponent" }
})
export class VocbenchPreferencesComponent {

    showFlags: boolean;
    themes: Theme[] = UIUtils.themes;
    private selectedTheme: Theme = this.themes[0];

    constructor(private properties: VBProperties) { }

    ngOnInit() {
        //no need to call the service to get the following preferences, since they are already initialized when user accessed the project
        this.showFlags = this.properties.getShowFlags()
        let projThemePref = VBContext.getWorkingProjectCtx().getProjectPreferences().projectThemeId;
        this.themes.forEach(t => {
            if (t.id == projThemePref) { this.selectedTheme = t; }
        });
    }

    //show flags handlers

    onShowFlagChange() {
        this.properties.setShowFlags(this.showFlags);
    }

    //theme handler
    changeTheme(theme: Theme) {
        this.selectedTheme = theme;
        this.properties.setProjectTheme(this.selectedTheme.id);
    }

}