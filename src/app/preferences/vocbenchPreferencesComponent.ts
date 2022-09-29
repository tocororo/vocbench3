import { Component } from "@angular/core";
import { UIUtils } from "../utils/UIUtils";
import { VBContext } from "../utils/VBContext";
import { VBProperties } from "../utils/VBProperties";

@Component({
    selector: "vb-preferences-component",
    templateUrl: "./vocbenchPreferencesComponent.html",
    host: { class: "pageComponent" }
})
export class VocbenchPreferencesComponent {

    showFlags: boolean;
    themes: number[] = UIUtils.themes;
    private selectedTheme: number = this.themes[0];

    constructor(private properties: VBProperties) { }

    ngOnInit() {
        //no need to call the service to get the following preferences, since they are already initialized when user accessed the project
        this.showFlags = this.properties.getShowFlags();
        let projThemePref = VBContext.getWorkingProjectCtx().getProjectPreferences().projectThemeId;
        this.themes.forEach(t => {
            if (t == projThemePref) { this.selectedTheme = t; }
        });
    }

    //show flags handlers

    onShowFlagChange() {
        this.properties.setShowFlags(this.showFlags).subscribe();
    }

    //theme handler
    changeTheme(theme: number) {
        this.selectedTheme = theme;
        this.properties.setProjectTheme(this.selectedTheme).subscribe();
    }

}