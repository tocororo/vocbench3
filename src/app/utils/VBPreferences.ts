import { Injectable } from '@angular/core';
import { PreferencesServices } from '../services/preferencesServices';
import { ARTURIResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { Cookie } from '../utils/Cookie';
import { VBEventHandler } from '../utils/VBEventHandler';

@Injectable()
export class VBPreferences {

    private languages: string[] = []; //contains langTag or a single element "*" that means all languages
    private activeScheme: ARTURIResource;
    private showFlags: boolean = true;
    private showInstancesNumber: boolean = true;

    constructor(private prefService: PreferencesServices, private eventHandler: VBEventHandler) {}

    /**
     * To call each time the user change project
     */
    initUserProjectPreferences() {
        return this.prefService.getProjectPreferences().map(
            prefs => {
                this.languages = prefs.languages;
                let activeSchemePref = prefs.active_scheme;
                if (activeSchemePref != null) {
                    this.activeScheme = new ARTURIResource(prefs.active_scheme, null, RDFResourceRolesEnum.conceptScheme);
                } else {
                    this.activeScheme = null;
                }
                this.showFlags = prefs.show_flags;
                this.showInstancesNumber = prefs.show_instances_number;
            }
        )
    }

    getActiveScheme(): ARTURIResource {
        return this.activeScheme;
    }
    setActiveScheme(scheme: ARTURIResource) {
        this.activeScheme = scheme;
        this.prefService.setActiveScheme(scheme).subscribe(
            stResp => {
                this.eventHandler.schemeChangedEvent.emit(scheme);
            }
        );
    }

    getShowFlags(): boolean {
        return this.showFlags;
    }
    setShowFlags(show: boolean) {
        this.showFlags = show;
        this.prefService.setShowFlags(show).subscribe();
    }

    getShowInstancesNumber(): boolean {
        return this.showInstancesNumber;
    }
    setShowInstancesNumber(show: boolean) {
        this.showInstancesNumber = show;
        this.prefService.setShowInstancesNumb(show).subscribe();
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

export type ResourceViewMode = "tabbed" | "splitted";
export const ResourceViewMode = {
    tabbed: "tabbed" as ResourceViewMode,
    splitted: "splitted" as ResourceViewMode
}