import { Component } from "@angular/core";
import { UIUtils, Theme } from "../utils/UIUtils";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties, ResourceViewMode } from "../utils/VBProperties";
import { Language, LanguageUtils } from "../models/LanguagesCountries";

@Component({
    selector: "vb-settings-component",
    templateUrl: "./vocbenchSettingsComponent.html",
    host: { class: "pageComponent" }
})
export class VocbenchSettingsComponent {

    private resViewMode: ResourceViewMode;
    private renderingLanguages: LanguageItem[] = [];
    private showFlags: boolean;
    private showInstNumb: boolean;
    private themes: Theme[] = UIUtils.themes;
    private selectedTheme: Theme = this.themes[0];

    constructor(private properties: VBProperties, private eventHandler: VBEventHandler) { }

    ngOnInit() {
        // this.preferences.initUserProjectPreferences();
        //res view mode
        this.resViewMode = this.properties.getResourceViewMode();
        var projectLanguages: Language[] = this.properties.getLanguages();

        //languages
        var preferredLanguages: string[] = this.properties.getLexicalizationLangs();
        this.renderingLanguages = [];
        if (preferredLanguages.length == 1 && preferredLanguages[0] == "*") { //"*" stands for all languages
            //set as selected renderingLangs all the available langs
            for (var i = 0; i < projectLanguages.length; i++) {
                this.renderingLanguages.push({
                    lang: projectLanguages[i],
                    active: false,
                    default: false
                });
            }
            this.initDefaultLangItem(preferredLanguages);
        } else {
            //set as selected renderingLangs only the listed by the preference
            for (var i = 0; i < projectLanguages.length; i++) {
                this.renderingLanguages.push({
                    lang: projectLanguages[i],
                    active: (preferredLanguages.indexOf(projectLanguages[i].tag) != -1), //active if the language is among the listed in preferences
                    default: false
                });
            }
            this.initDefaultLangItem(preferredLanguages);
        }

        //show_flags
        this.showFlags = this.properties.getShowFlags();

        //show_instances_number
        this.showInstNumb = this.properties.getShowInstancesNumber();

        //project_theme
        let themeId = this.properties.getProjectTheme();
        this.themes.forEach(t => {
            if (t.id == themeId) { this.selectedTheme = t; }
        });
    }

    private initDefaultLangItem(preferenceLangs?: string[]) {
        if (preferenceLangs == null || (preferenceLangs.length == 1 && preferenceLangs[0] == "*")) {
            //in case of all language for rendering, set the default language based on a priority list
            defaultLangPriorityLoop: 
            for (var i = 0; i < LanguageUtils.priorityLangs.length; i++) { //iterate over the priority languages list
                for (var j = 0; j < this.renderingLanguages.length; j++) { //then over the rendering languages
                    //if the rendering lang is the priority, set it as default and break the iteration
                    if (this.renderingLanguages[j].lang.tag == LanguageUtils.priorityLangs[i]) {
                        this.renderingLanguages[j].default = true;
                        break defaultLangPriorityLoop;
                    }
                }
            }
            //every language in priority lang is not among those available in project => set as the default the first lang in project
            if (this.getDefaultLangItem() == null) {
                this.renderingLanguages[0].default = true;
            }
        } else { //preferred languages specified
            defaultLangPrefLoop: //based on preferences
            for (var i = 0; i < preferenceLangs.length; i++) {
                for (var j = 0; j < this.renderingLanguages.length; j++) { //iterate over the rendering languages
                    //if the rendering lang is in the lexicalizationLangs, set it as default and break the iteration
                    if (this.renderingLanguages[j].lang.tag == preferenceLangs[i]) {
                        this.renderingLanguages[j].default = true;
                        break defaultLangPrefLoop;
                    }
                }
            }
            //if default language is still not set => set the default lang based on priority list
            if (this.getDefaultLangItem() == null) {
                defaultLangPriorityLoop:
                for (var i = 0; i < LanguageUtils.priorityLangs.length; i++) { //iterate over the priority languages list
                    for (var j = 0; j < this.renderingLanguages.length; j++) { //then over the rendering languages
                        //if the rendering lang is the priority, set it as default and break the iteration
                        if (this.renderingLanguages[j].lang.tag == LanguageUtils.priorityLangs[i]) {
                            this.renderingLanguages[j].default = true;
                            break defaultLangPriorityLoop;
                        }
                    }
                }
            }
            //every language in preferences is not among those available in project => set as the default the first lang in project
            if (this.getDefaultLangItem() == null) {
                this.renderingLanguages[0].default = true;
            }
        }
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
        if (!checked) { //if it is deselecting all set en as default
            this.initDefaultLangItem();
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
        if (activeLangs.length == 0) { //if now all language are not-active init the default
            this.initDefaultLangItem();
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
        for (var i = 0; i < this.renderingLanguages.length; i++) {
            if (this.renderingLanguages[i].active) {
                activeLangs.push(this.renderingLanguages[i]);
            }
        }
        return activeLangs;
    }

    /**
     * Set the given language tag as default
     * @param langTag
     */
    private setDefaultLang(langTag: string) {
        for (var i = 0; i < this.renderingLanguages.length; i++) {
            if (this.renderingLanguages[i].lang.tag == langTag) {
                this.renderingLanguages[i].default = true;
            } else {
                this.renderingLanguages[i].default = false;
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
        this.properties.setLexicalizationLangs(preferenceLangs);
    }

    private getFlagImgSrc(langTag: string): string {
        return UIUtils.getFlagImgSrc(langTag);
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