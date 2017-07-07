import { Component } from "@angular/core";
import { UIUtils, Theme } from "../utils/UIUtils";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBPreferences, ResourceViewMode } from "../utils/VBPreferences";
import { Languages } from "../models/LanguagesCountries";

@Component({
    selector: "vb-settings-component",
    templateUrl: "./vocbenchSettingsComponent.html",
    host: { class: "pageComponent" }
})
export class VocbenchSettingsComponent {

    private resViewMode: ResourceViewMode;
    private renderingLangs: LanguageItem[] = [];
    private showFlags: boolean;
    private showInstNumb: boolean;
    private themes: Theme[] = UIUtils.themes;
    private selectedTheme: Theme = this.themes[0];

    constructor(private preferences: VBPreferences, private eventHandler: VBEventHandler) { }

    ngOnInit() {
        this.preferences.initUserProjectPreferences();
        //res view mode
        this.resViewMode = this.preferences.getResourceViewMode();

        //languages
        var langs = this.preferences.getLanguages();
        this.renderingLangs = [];
        if (langs.length == 1 && langs[0] == "*") { //"*" stands for all languages
            //set as selected renderingLangs all the available langs
            for (var i = 0; i < Languages.languageList.length; i++) {
                this.renderingLangs.push({
                    lang: Languages.languageList[i],
                    active: false,
                    default: (Languages.languageList[i].tag == "en") //set english (en) as default
                });
            }
        } else {
            //set as selected renderingLangs only the listed by the preference
            for (var i = 0; i < Languages.languageList.length; i++) {
                this.renderingLangs.push({
                    lang: Languages.languageList[i],
                    active: (langs.indexOf(Languages.languageList[i].tag) != -1),
                    default: (langs.indexOf(Languages.languageList[i].tag) == 0) //set as default the first language of the preferences
                });
            }
        }

        //show_flags
        this.showFlags = this.preferences.getShowFlags();

        //show_instances_number
        this.showInstNumb = this.preferences.getShowInstancesNumber();

        //project_theme
        let themeId = this.preferences.getProjectTheme();
        this.themes.forEach(t => {
            if (t.id == themeId) { this.selectedTheme = t; }
        });
    }

    //res view mode handler

    private onResViewModeChanged() {
        this.preferences.setResourceViewMode(this.resViewMode);
        this.eventHandler.resViewModeChangedEvent.emit(this.resViewMode);
    }

    //languages handlers

    private changeAllLangStatus(checked: boolean) {
        for (var i = 0; i < this.renderingLangs.length; i++) {
            this.renderingLangs[i].active = checked;
        }
        if (!checked) { //if it is deselecting all set en as default
            this.setDefaultLang("en");
        }
        this.updateLanguagesPref();
    }

    /**
     * Listener of "default" language radio button
     * @param changedItem
     */
    private onDefaultLangChanged(changedItem: LanguageItem) {
        //set the default to true only to the selected lang
        this.setDefaultLang(changedItem.lang.tag);
        this.updateLanguagesPref();
    }

    /**
     * Listener of "active" language checkbox state change
     * @param changedItem
     */
    private onActiveLangChanged(changedItem: LanguageItem) {
        var activeLangs: LanguageItem[] = this.getActiveLanguageItems();
        if (activeLangs.length == 0) { //if now all language are not-active set "en" as default
            this.setDefaultLang("en");
        } else if (activeLangs.length == 1) { //if now only one language is active set it as default
            this.setDefaultLang(activeLangs[0].lang.tag);
        } else { //if now more languages are active...
            if (!changedItem.active && changedItem.default) { //...and the changed lang is now not-active and is the default
                this.setDefaultLang(activeLangs[0].lang.tag); //set as the default the first available lang
            }
        }
        this.updateLanguagesPref();
    }

    private getActiveLanguageItems(): LanguageItem[] {
        var activeLangs: LanguageItem[] = [];
        for (var i = 0; i < this.renderingLangs.length; i++) {
            if (this.renderingLangs[i].active) {
                activeLangs.push(this.renderingLangs[i]);
            }
        }
        return activeLangs;
    }

    /**
     * Set the given language tag as default
     * @param langTag
     */
    private setDefaultLang(langTag: string) {
        for (var i = 0; i < this.renderingLangs.length; i++) {
            if (this.renderingLangs[i].lang.tag == langTag) {
                this.renderingLangs[i].default = true;
            } else {
                this.renderingLangs[i].default = false;
            }
        }
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
        this.preferences.setLanguages(preferenceLangs);
    }

    private getFlagImgSrc(langTag: string): string {
        return UIUtils.getFlagImgSrc(langTag);
    }

    //show flags handlers

    private onShowFlagChange() {
        this.preferences.setShowFlags(this.showFlags);
    }

    //show flags handlers

    private onShowInstNumbChange() {
        this.preferences.setShowInstancesNumber(this.showInstNumb);
    }

    //theme handler
    private changeTheme(theme: Theme) {
        this.selectedTheme = theme;
        this.preferences.setProjectTheme(this.selectedTheme.id);
    }
    

}

/**
 * Support class that represent a list item of the languages preference
 */
class LanguageItem {
    public lang: { name: string, tag: string };
    public active: boolean;
    public default: boolean;
}