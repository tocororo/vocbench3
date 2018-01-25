import { Component } from "@angular/core";
import { UIUtils, Theme } from "../utils/UIUtils";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties } from "../utils/VBProperties";
import { Language } from "../models/LanguagesCountries";
import { Properties, ResourceViewMode } from "../models/Properties";
import { PreferencesSettingsServices } from "../services/preferencesSettingsServices";

@Component({
    selector: "vb-preferences-component",
    templateUrl: "./vocbenchPreferencesComponent.html",
    host: { class: "pageComponent" }
})
export class VocbenchPreferencesComponent {

    private resViewMode: ResourceViewMode;
    private resViewTabSync: boolean;
    private showFlags: boolean;
    private showInstNumb: boolean;
    private themes: Theme[] = UIUtils.themes;
    private selectedTheme: Theme = this.themes[0];

    constructor(private properties: VBProperties, private prefSettingService: PreferencesSettingsServices, private eventHandler: VBEventHandler) { }

    ngOnInit() {
        //no need to call the service to get the following preferences, since they are already initialized when user accessed the project
        this.showFlags = this.properties.getShowFlags()
        this.showInstNumb = this.properties.getShowInstancesNumber();
        let projThemePref = this.properties.getProjectTheme();
        this.themes.forEach(t => {
            if (t.id == projThemePref) { this.selectedTheme = t; }
        });

        this.resViewMode = this.properties.getResourceViewMode();
        this.resViewTabSync = this.properties.getResourceViewTabSync();
        var projectLanguages: Language[] = this.properties.getProjectLanguages();
    }

    //res view mode handler

    private onResViewModeChanged() {
        this.properties.setResourceViewMode(this.resViewMode);
        this.eventHandler.resViewModeChangedEvent.emit(this.resViewMode);
    }

    private onTabSyncChange() {
        this.properties.setResourceViewTabSync(this.resViewTabSync);
        this.eventHandler.resViewTabSyncChangedEvent.emit(this.resViewTabSync);
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