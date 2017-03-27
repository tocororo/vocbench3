import { Injectable } from '@angular/core';
import { PreferencesServices } from '../services/preferencesServices';
import { Cookie } from '../utils/Cookie';

@Injectable()
export class VBPreferences {

    private showFlags: boolean = true;
    private languages: string[] = []; //contains langTag or a single element "*" that means all languages

    constructor(private prefService: PreferencesServices) {}

    /**
     * To call each time the user change project
     */
    initUserProjectPreferences() {
        this.prefService.getProjectPreferences().subscribe(
            prefs => {
                this.showFlags = prefs.show_flags;
                this.languages = prefs.languages;
            }
        )
    }

    getShowFlags(): boolean {
        return this.showFlags;
    }
    setShowFlags(show: boolean) {
        this.showFlags = show;
        this.prefService.setShowFlags(show).subscribe();
    }

    getLanguages(): string[] {
        return this.languages;
    }
    setLanguages(langs: string[]) {
        this.languages = langs;
        this.prefService.setLanguages(langs).subscribe()
    }

    /**
     * Returns the default language, used to select the language when creating a resource with lang
     * Returns the first lang of languages array or "en" in case languages is *
     */
    getDefaultLanguage() {
        var firstLang = this.languages[0];
        if (firstLang == "*") {
            return "en";
        }
        return firstLang;
    }

    //PREFERENCES STORED IN COOKIES

    /**
     * Sets the preference to show or hide the inferred information in resource view
     */
    setInferenceInResourceView(showInferred: boolean) {
        Cookie.setCookie(Cookie.VB_INFERENCE_IN_RES_VIEW, showInferred + "", 365 * 10);
    }
    /**
     * Gets the preference to show or hide the inferred information in resource view
     */
    getInferenceInResourceView() {
        return Cookie.getCookie(Cookie.VB_INFERENCE_IN_RES_VIEW) == "true";
    }

    /**
     * Sets the preference about the resource view mode
     */
    setResourceViewMode(mode: ResourceViewMode) {
        Cookie.setCookie(Cookie.VB_RESOURCE_VIEW_MODE, mode, 365 * 10);
    }
    /**
     * Gets the preference about the resource view mode
     */
    getResourceViewMode(): ResourceViewMode {
        let mode: ResourceViewMode = <ResourceViewMode>Cookie.getCookie(Cookie.VB_RESOURCE_VIEW_MODE);
        if (mode != ResourceViewMode.splitted && mode != ResourceViewMode.tabbed) {
            mode = ResourceViewMode.tabbed;
            this.setResourceViewMode(mode);
        }
        return mode;
    }

}

export type PropertyLevel = "USER" | "PROJECT" | "SYSTEM";
export const PropertyLevel = {
    USER: "USER" as PropertyLevel,
    PROJECT: "PROJECT" as PropertyLevel,
    SYSTEM: "SYSTEM" as PropertyLevel
}

export type ResourceViewMode = "tabbed" | "splitted";
export const ResourceViewMode = {
    tabbed: "tabbed" as ResourceViewMode,
    splitted: "splitted" as ResourceViewMode
}