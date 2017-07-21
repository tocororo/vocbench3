import { Component } from "@angular/core";
import { UIUtils, Theme } from "../utils/UIUtils";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties, ResourceViewMode } from "../utils/VBProperties";
import { Language } from "../models/LanguagesCountries";
import { Properties } from "../models/Properties";
import { PreferencesSettingsServices } from "../services/preferencesSettingsServices";

@Component({
    selector: "vb-preferences-component",
    templateUrl: "./vocbenchPreferencesComponent.html",
    host: { class: "pageComponent" }
})
export class VocbenchPreferencesComponent {

    private resViewMode: ResourceViewMode;
    private renderingLanguages: LanguageItem[] = [];
    private showFlags: boolean;
    private showInstNumb: boolean;
    private themes: Theme[] = UIUtils.themes;
    private selectedTheme: Theme = this.themes[0];

    constructor(private properties: VBProperties, private prefSettingService: PreferencesSettingsServices, private eventHandler: VBEventHandler) { }

    ngOnInit() {
        var properties: string[] = [
            Properties.pref_show_flags, Properties.pref_show_instances_number, Properties.pref_project_theme
        ];
        this.prefSettingService.getProjectPreferences(properties).subscribe(
            prefs => {
                this.showFlags = prefs[Properties.pref_show_flags];

                this.showInstNumb = prefs[Properties.pref_show_instances_number];

                let projThemePref = prefs[Properties.pref_project_theme];
                this.themes.forEach(t => {
                    if (t.id == projThemePref) { this.selectedTheme = t; }
                });
            }
        );

        this.prefSettingService.getProjectPreferences([Properties.pref_languages], Properties.plugin_id_rendering_engine).subscribe(
            prefs => {
                let renderLangs = prefs[Properties.pref_languages];
                if (renderLangs.length == 1 && renderLangs[0] == "*") { //"*" stands for all languages
                    //set as selected renderingLangs all the available langs
                    for (var i = 0; i < projectLanguages.length; i++) {
                        this.renderingLanguages.push({
                            lang: projectLanguages[i],
                            active: false,
                            default: false
                        });
                    }
                } else {
                    //set as selected renderingLangs only the listed by the preference
                    for (var i = 0; i < projectLanguages.length; i++) {
                        this.renderingLanguages.push({
                            lang: projectLanguages[i],
                            active: (renderLangs.indexOf(projectLanguages[i].tag) != -1), //active if the language is among the listed in preferences
                            default: false
                        });
                    }
                }
            }
        );

        this.resViewMode = this.properties.getResourceViewMode();
        var projectLanguages: Language[] = this.properties.getProjectLanguages();
    }

    /**
     * Return the language item with default = true
     */
    private getDefaultLangItem(): LanguageItem {
        for (var i = 0; i < this.renderingLanguages.length; i++) {
            if (this.renderingLanguages[i].default) {
                return this.renderingLanguages[i];
            }
        }
        return null;
    }

    //res view mode handler

    private onResViewModeChanged() {
        this.properties.setResourceViewMode(this.resViewMode);
        this.eventHandler.resViewModeChangedEvent.emit(this.resViewMode);
    }

    //languages handlers

    private changeAllLangStatus(checked: boolean) {
        for (var i = 0; i < this.renderingLanguages.length; i++) {
            this.renderingLanguages[i].active = checked;
        }
        this.updateLanguagesPref();
    }

    private getActiveLanguageItems(): LanguageItem[] {
        var activeLangs: LanguageItem[] = [];
        for (var i = 0; i < this.renderingLanguages.length; i++) {
            if (this.renderingLanguages[i].active) {
                activeLangs.push(this.renderingLanguages[i]);
            }
        }
        return activeLangs;
    }

    private updateLanguagesPref() {
        //collect the active languages to set in the preference
        var preferenceLangs: string[] = [];
        var activeLangs: LanguageItem[] = this.getActiveLanguageItems();
        for (var i = 0; i <activeLangs.length; i++) {
            if (activeLangs[i].default) { //if default add it at first position
                preferenceLangs.unshift(activeLangs[i].lang.tag);
            } else {
                preferenceLangs.push(activeLangs[i].lang.tag);
            }
        }
        //no language checked
        if (preferenceLangs.length == 0) {
            preferenceLangs = ["*"];
        }
        this.prefSettingService.setLanguages(preferenceLangs).subscribe()
    }

    //show flags handlers

    private onShowFlagChange() {
        this.properties.setShowFlags(this.showFlags);
    }

    //show flags handlers

    private onShowInstNumbChange() {
        this.properties.setShowInstancesNumber(this.showInstNumb);
    }

    //theme handler
    private changeTheme(theme: Theme) {
        this.selectedTheme = theme;
        this.properties.setProjectTheme(this.selectedTheme.id);
    }
    

}

/**
 * Support class that represent a list item of the languages preference
 */
class LanguageItem {
    public lang: Language;
    public active: boolean;
    public default: boolean;
}