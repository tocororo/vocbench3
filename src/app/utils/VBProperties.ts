import { Injectable } from '@angular/core';
import { PreferencesSettingsServices } from '../services/preferencesSettingsServices';
import { ARTURIResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { Language, Languages } from '../models/LanguagesCountries';
import { Properties } from '../models/Properties';
import { ProjectTableColumnStruct } from '../models/Project';
import { Cookie } from '../utils/Cookie';
import { VBEventHandler } from '../utils/VBEventHandler';
import { UIUtils } from '../utils/UIUtils';
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices'

@Injectable()
export class VBProperties {

    private projectLanguagesSetting: Language[] = []; //all available languages in a project (settings)
    private projectLanguagesPreference: string[] = []; //languages that user

    private activeSchemes: ARTURIResource[] = [];
    private showFlags: boolean = true;
    private showInstancesNumber: boolean = true;
    private projectThemeId: number = null;

    private searchSettings: SearchSettings = {
        stringMatchMode: StringMatchMode.contains,
        useURI: true,
        useLocalName: true,
        restrictLang: false,
        languages: [],
        restrictActiveScheme: true,
        classIndividualSearchMode: ClassIndividualPanelSearchMode.all
    };

    constructor(private prefService: PreferencesSettingsServices, private basicModals: BasicModalServices, private eventHandler: VBEventHandler) {}

    /* =============================
    ========= PREFERENCES ==========
    ============================= */

    /**
     * To call each time the user change project
     */
    initUserProjectPreferences() {
        var properties: string[] = [
            Properties.pref_active_schemes, Properties.pref_show_flags,
            Properties.pref_show_instances_number, Properties.pref_project_theme,
            Properties.pref_search_languages, Properties.pref_search_restrict_lang
        ];
        this.prefService.getProjectPreferences(properties).subscribe(
            prefs => {
                this.activeSchemes = [];
                let activeSchemesPref: string = prefs[Properties.pref_active_schemes];
                if (activeSchemesPref != null) {
                    let skSplitted: string[] = activeSchemesPref.split(",");
                    for (var i = 0; i < skSplitted.length; i++) {
                        this.activeSchemes.push(new ARTURIResource(skSplitted[i], null, RDFResourceRolesEnum.conceptScheme));
                    }
                }

                this.showFlags = prefs[Properties.pref_show_flags] == "true";

                this.showInstancesNumber = prefs[Properties.pref_show_instances_number] == "true";
                
                this.projectThemeId = prefs[Properties.pref_project_theme];
                UIUtils.changeNavbarTheme(this.projectThemeId);

                let searchLangsPref = prefs[Properties.pref_search_languages];
                if (searchLangsPref == null) {
                    this.searchSettings.languages = [];
                } else {
                    this.searchSettings.languages = JSON.parse(searchLangsPref);
                }

                this.searchSettings.restrictLang = prefs[Properties.pref_search_languages] == "true";

                this.initSearchSettingsCookie(); //other settings stored in cookies
            }
        );

        // this is called separately since requires the pluginId parameter
        this.prefService.getProjectPreferences([Properties.pref_languages], Properties.plugin_id_rendering_engine).subscribe(
            prefs => {
                this.projectLanguagesPreference = prefs[Properties.pref_languages].split(",");
            }
        );
    }

    getActiveSchemes(): ARTURIResource[] {
        return this.activeSchemes;
    }
    setActiveSchemes(schemes: ARTURIResource[]) {
        if (schemes == null) {
            this.activeSchemes = [];
        } else {
            this.activeSchemes = schemes;
        }
        this.prefService.setActiveSchemes(schemes).subscribe(
            stResp => {
                this.eventHandler.schemeChangedEvent.emit(schemes);
            }
        );
    }
    isActiveScheme(scheme: ARTURIResource) {
        for (var i = 0; i < this.activeSchemes.length; i++) {
            if (scheme.getURI() == this.activeSchemes[i].getURI()) {
                return true;
            }
        }
        return false;
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

    getProjectTheme(): number {
        return this.projectThemeId;
    }
    setProjectTheme(theme: number) {
        this.projectThemeId = theme;
        UIUtils.changeNavbarTheme(this.projectThemeId);
        this.prefService.setProjectTheme(theme).subscribe();
    }

    getLanguagesPreference(): string[] {
        return this.projectLanguagesPreference;
    }
    setLanguagesPreference(languages: string[]) {
        this.projectLanguagesPreference = languages;
    }

    /* =============================
    =========== SETTINGS ===========
    ============================= */

    initProjectSettings() {
        var properties: string[] = [Properties.setting_languages];
        this.prefService.getProjectSettings(properties).subscribe(
            settings => {
                var langsValue: string = settings[Properties.setting_languages];
                try {
                    this.projectLanguagesSetting = <Language[]>JSON.parse(langsValue);
                    Languages.sortLanguages(this.projectLanguagesSetting);
                } catch (err) {
                    this.basicModals.alert("Error", "Project setting initialization has encountered a problem during parsing " +
                        "languages settings. Default languages will be set for this project.", "error");
                    this.projectLanguagesSetting = [
                        { name: "German" , tag: "de" }, { name: "English" , tag: "en" }, { name: "Spanish" , tag: "es" },
                        { name: "French" , tag: "fr" }, { name: "Italian" , tag: "it" }
                    ];
                }
            }
        );
    }

    /**
     * Returns the language available in the project
     */
    getProjectLanguages(): Language[] {
        return this.projectLanguagesSetting;
    }
    setProjectLanguages(languages: Language[]) {
        this.projectLanguagesSetting = languages;
    }


    
    /* =============================
    ==== PREFERENCES IN COOKIES ====
    ============================= */

    /**
     * Sets the preference to show or hide the inferred information in resource view
     */
    setInferenceInResourceView(showInferred: boolean) {
        Cookie.setCookie(Cookie.RES_VIEW_INCLUDE_INFERENCE, showInferred + "", 365*10);
    }
    /**
     * Gets the preference to show or hide the inferred information in resource view
     */
    getInferenceInResourceView(): boolean {
        return Cookie.getCookie(Cookie.RES_VIEW_INCLUDE_INFERENCE) == "true";
    }

    /**
     * Sets the preference to show the URI or the rendering of resources in resource view
     */
    setRenderingInResourceView(rendering: boolean) {
        Cookie.setCookie(Cookie.RES_VIEW_RENDERING, rendering + "", 365*10);
    }
    /**
     * Gets the preference to show the URI or the rendering of resources in resource view
     */
    getRenderingInResourceView(): boolean {
        let cookieValue: string = Cookie.getCookie(Cookie.RES_VIEW_RENDERING);
        return (cookieValue == null || cookieValue == "true"); //default true, so true if cookie is not defined
    }

    /**
     * Sets the preference about the resource view mode
     */
    setResourceViewMode(mode: ResourceViewMode) {
        Cookie.setCookie(Cookie.RES_VIEW_MODE, mode, 365*10);
    }
    /**
     * Gets the preference about the resource view mode
     */
    getResourceViewMode(): ResourceViewMode {
        let mode: ResourceViewMode = <ResourceViewMode>Cookie.getCookie(Cookie.RES_VIEW_MODE);
        if (mode != ResourceViewMode.splitted && mode != ResourceViewMode.tabbed) {
            mode = ResourceViewMode.tabbed;
            this.setResourceViewMode(mode);
        }
        return mode;
    }
    /**
     * Sets the preference to keep in sync the tree/list with the resource in the tab
     * @param sync
     */
    setResourceViewTabSync(sync: boolean) {
        Cookie.setCookie(Cookie.RES_VIEW_TAB_SYNCED, sync + "", 365*10);
    }
    /**
     * Gets the preference to keep in sync the tree/list with the resource in the tab
     */
    getResourceViewTabSync(): boolean {
        let cookieValue: string = Cookie.getCookie(Cookie.RES_VIEW_TAB_SYNCED);
        return cookieValue == "true";
    }


    initSearchSettingsCookie() {
        let searchModeCookie: string = Cookie.getCookie(Cookie.SEARCH_STRING_MATCH_MODE);
        if (searchModeCookie != null) {
            this.searchSettings.stringMatchMode = <StringMatchMode>searchModeCookie;
        }
        let useUriCookie: string = Cookie.getCookie(Cookie.SEARCH_USE_URI);
        if (useUriCookie != null) {
            this.searchSettings.useURI = useUriCookie == "true";
        }
        let useLocalNameCookie: string = Cookie.getCookie(Cookie.SEARCH_USE_LOCAL_NAME);
        if (useLocalNameCookie != null) {
            this.searchSettings.useLocalName = useLocalNameCookie == "true";
        }
        let restrictSchemesCookie: string = Cookie.getCookie(Cookie.SEARCH_CONCEPT_SCHEME_RESTRICTION);
        if (restrictSchemesCookie != null) {
            this.searchSettings.restrictActiveScheme = restrictSchemesCookie == "true";
        }
        let clsIndPanelSearchModeCookie: string = Cookie.getCookie(Cookie.SEARCH_CLS_IND_PANEL);
        if (clsIndPanelSearchModeCookie != null) {
            this.searchSettings.classIndividualSearchMode = <ClassIndividualPanelSearchMode>clsIndPanelSearchModeCookie;
        }
    }

    getSearchSettings(): SearchSettings {
        return this.searchSettings;
    }
    setSearchSettings(settings: SearchSettings) {
        Cookie.setCookie(Cookie.SEARCH_STRING_MATCH_MODE, this.searchSettings.stringMatchMode, 365*10);
        Cookie.setCookie(Cookie.SEARCH_USE_URI, this.searchSettings.useURI+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_USE_LOCAL_NAME, this.searchSettings.useLocalName+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_CONCEPT_SCHEME_RESTRICTION, this.searchSettings.restrictActiveScheme+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_CLS_IND_PANEL, this.searchSettings.classIndividualSearchMode, 365*10);
        if (this.searchSettings.languages != settings.languages) {
            this.prefService.setProjectPreference(Properties.pref_search_languages, JSON.stringify(this.searchSettings.languages)).subscribe();
        }
        if (this.searchSettings.restrictLang != settings.restrictLang) {
            this.prefService.setProjectPreference(Properties.pref_search_restrict_lang, this.searchSettings.restrictLang+"").subscribe();
        }
        this.searchSettings = settings;
    }

    
    getDefaultProjectTableColumns(): ProjectTableColumnStruct[] {
        return [
            { name: "Accessed", show: true, mandatory: true }, { name: "Open/Close", show: true, mandatory: true },
            { name: "Project Name", show: true, mandatory: true }, { name: "Model", show: true },
            { name: "Lexicalization Model", show: true }, { name: "History", show: true },
            { name: "Validation", show: true }, { name: "Status", show: true }
        ];
    };
    getCustomProjectTableColumns(): ProjectTableColumnStruct[] {
        var columns: ProjectTableColumnStruct[] = this.getDefaultProjectTableColumns();
        var value = Cookie.getCookie(Cookie.PROJECT_TABLE_ORDER);
        if (value != null) {
            columns = JSON.parse(value);
        }
        return columns;
    }

}

export type ResourceViewMode = "tabbed" | "splitted";
export const ResourceViewMode = {
    tabbed: "tabbed" as ResourceViewMode,
    splitted: "splitted" as ResourceViewMode
}

export class SearchSettings {
    public stringMatchMode: StringMatchMode;
    public useURI: boolean;
    public useLocalName: boolean;
    public restrictLang: boolean;
    public languages: string[];
    public restrictActiveScheme: boolean;
    public classIndividualSearchMode: ClassIndividualPanelSearchMode;
}

export type StringMatchMode = "startsWith" | "contains" | "endsWith";
export const StringMatchMode = {
    startsWith: "startsWith" as StringMatchMode,
    contains: "contains" as StringMatchMode,
    endsWith: "endsWith" as StringMatchMode
}

export type ClassIndividualPanelSearchMode = "onlyClasses" | "onlyInstances" | "all";
export const ClassIndividualPanelSearchMode = {
    onlyClasses: "onlyClasses" as ClassIndividualPanelSearchMode,
    onlyInstances: "onlyInstances" as ClassIndividualPanelSearchMode,
    all: "all" as ClassIndividualPanelSearchMode
}
