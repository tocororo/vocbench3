import { Injectable } from '@angular/core';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { Language, Languages } from '../models/LanguagesCountries';
import { ExtensionPointID, Scope } from '../models/Plugins';
import { ClassTreePreference, ConceptTreePreference, InstanceListPreference, LexicalEntryListPreference, NotificationStatus, PartitionFilterPreference, PreferencesUtils, PrefLabelClashMode, ProjectPreferences, ProjectSettings, ResourceViewMode, ResourceViewPreference, SearchMode, SearchSettings, SettingsEnum, SystemSettings, ValueFilterLanguages } from '../models/Properties';
import { ResViewPartition } from '../models/ResourceView';
import { AdministrationServices } from '../services/administrationServices';
import { PreferencesSettingsServices } from '../services/preferencesSettingsServices';
import { SettingsServices } from '../services/settingsServices';
import { Cookie } from '../utils/Cookie';
import { VBEventHandler } from '../utils/VBEventHandler';
import { VBRequestOptions } from './HttpManager';
import { ProjectContext, VBContext } from './VBContext';

@Injectable()
export class VBProperties {

    private eventSubscriptions: Subscription[] = [];

    constructor(private prefService: PreferencesSettingsServices, private adminService: AdministrationServices, private settingsService: SettingsServices,
        private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: { oldResource: ARTResource, newResource: ARTResource }) => this.onResourceRenamed(data.oldResource, data.newResource)
        ));
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    /* =============================
    ========= PREFERENCES ==========
    ============================= */

    /**
     * To call each time the user change project
     */
    initUserProjectPreferences(projectCtx: ProjectContext): Observable<any> {
        let getPUSettingsCore = this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, VBRequestOptions.getRequestOptions(projectCtx)).pipe(
            map(settings => {
                let projectPreferences: ProjectPreferences = projectCtx.getProjectPreferences();

                let activeSchemes: ARTURIResource[] = [];
                let schemesStr: string[] = settings.getPropertyValue(SettingsEnum.activeSchemes);
                if (schemesStr != null) {
                    schemesStr.forEach(s => activeSchemes.push(new ARTURIResource(s, null, RDFResourceRolesEnum.conceptScheme)));
                }
                projectPreferences.activeSchemes = activeSchemes;

                let activeLexicon: ARTURIResource;
                let activeLexiconStr: string = settings.getPropertyValue(SettingsEnum.activeLexicon);
                if (activeLexiconStr != null) {
                    activeLexicon = new ARTURIResource(activeLexiconStr, null, RDFResourceRolesEnum.limeLexicon);
                }
                projectPreferences.activeLexicon = activeLexicon;

                projectPreferences.showFlags = settings.getPropertyValue(SettingsEnum.showFlags);

                let projectThemeId = settings.getPropertyValue(SettingsEnum.projectTheme);
                projectPreferences.projectThemeId = projectThemeId;
                this.eventHandler.themeChangedEvent.emit(projectPreferences.projectThemeId);

                //languages 
                projectPreferences.editingLanguage = settings.getPropertyValue(SettingsEnum.editingLanguage);

                let filterValueLangPref = settings.getPropertyValue(SettingsEnum.filterValueLanguages);
                if (filterValueLangPref == null) {
                    projectPreferences.filterValueLang = { languages: [], enabled: false }; //default
                } else {
                    projectPreferences.filterValueLang = filterValueLangPref;
                }

                //resource view preferences
                projectPreferences.resViewPreferences = new ResourceViewPreference();
                let resViewSetting: ResourceViewPreference = settings.getPropertyValue(SettingsEnum.resourceView);
                if (resViewSetting != null) {
                    PreferencesUtils.mergePreference(projectPreferences.resViewPreferences, resViewSetting);
                }
                this.initResourceViewPreferenceCookie(projectPreferences); //fill the preferences also with those stored as cookie

                //graph preferences
                let graphPartitionFilterPref = settings.getPropertyValue(SettingsEnum.graphViewPartitionFilter);
                if (graphPartitionFilterPref == null) { //initialize with the only lexicalization partition for each role
                    let graphPartitionFilterPref: PartitionFilterPreference = {};
                    for (let role in RDFResourceRolesEnum) { 
                        graphPartitionFilterPref[role] = [ResViewPartition.lexicalizations];
                    }
                }
                projectPreferences.graphViewPartitionFilter = graphPartitionFilterPref;

                projectPreferences.hideLiteralGraphNodes = settings.getPropertyValue(SettingsEnum.hideLiteralGraphNodes);

                //cls tree preferences
                projectPreferences.classTreePreferences = new ClassTreePreference(projectCtx.getProject());
                let clsTreeSettings: ClassTreePreference = settings.getPropertyValue(SettingsEnum.classTree);
                if (clsTreeSettings != null) {
                    PreferencesUtils.mergePreference(projectPreferences.classTreePreferences, clsTreeSettings);
                }

                //instance list preferences
                projectPreferences.instanceListPreferences = new InstanceListPreference();
                let instListSetting: InstanceListPreference = settings.getPropertyValue(SettingsEnum.instanceList);
                if (instListSetting != null) {
                    PreferencesUtils.mergePreference(projectPreferences.instanceListPreferences, instListSetting);
                }


                //concept tree preferences
                projectPreferences.conceptTreePreferences = new ConceptTreePreference();
                let concTreeSetting: ConceptTreePreference = settings.getPropertyValue(SettingsEnum.conceptTree);
                if (concTreeSetting != null) {
                    PreferencesUtils.mergePreference(projectPreferences.conceptTreePreferences, concTreeSetting);
                }


                //lexical entry list preferences
                projectPreferences.lexEntryListPreferences = new LexicalEntryListPreference();
                let lexEntrySetting: LexicalEntryListPreference = settings.getPropertyValue(SettingsEnum.lexEntryList);
                if (lexEntrySetting != null) {
                    PreferencesUtils.mergePreference(projectPreferences.lexEntryListPreferences, lexEntrySetting);
                }

                //search settings
                let searchSettings: SearchSettings = settings.getPropertyValue(SettingsEnum.searchSettings);
                if (searchSettings == null) {
                    searchSettings = new SearchSettings();
                }
                projectPreferences.searchSettings = searchSettings;
                this.initSearchSettingsCookie(projectPreferences); //other settings stored in cookies

                //notifications
                let notificationStatusSetting = settings.getPropertyValue(SettingsEnum.notificationsStatus);
                if (notificationStatusSetting != null) {
                    projectPreferences.notificationStatus = notificationStatusSetting;
                }
            })
        )
        // this is called separately since it is about a different plugin
        let getPUSettingsRenderingEngine = this.settingsService.getSettings(ExtensionPointID.RENDERING_ENGINE_ID, Scope.PROJECT_USER, VBRequestOptions.getRequestOptions(projectCtx)).pipe(
            map(settings => {
                projectCtx.getProjectPreferences().renderingLanguagesPreference = settings.getPropertyValue(SettingsEnum.languages).split(",");
            })
        )
        return forkJoin([
            getPUSettingsRenderingEngine, 
            getPUSettingsCore, 
        ]);
    }

    setActiveSchemes(projectCtx: ProjectContext, schemes: ARTURIResource[]) {
        if (schemes == null) {
            projectCtx.getProjectPreferences().activeSchemes = [];
        } else {
            projectCtx.getProjectPreferences().activeSchemes = schemes;
        }
        this.eventHandler.schemeChangedEvent.emit({schemes: schemes, project: projectCtx.getProject() });
        let schemesPropValue: string[] = schemes.map(s => s.toNT());
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.activeSchemes, schemesPropValue, new VBRequestOptions({ctxProject: projectCtx.getProject()})).subscribe();
    }

    setActiveLexicon(projectCtx: ProjectContext, lexicon: ARTURIResource) {
        projectCtx.getProjectPreferences().activeLexicon = lexicon;
        this.eventHandler.lexiconChangedEvent.emit({ lexicon: lexicon, project: projectCtx.getProject() });
        let lexiconUri: string = lexicon != null ? lexicon.toNT() : null;
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.activeLexicon, lexiconUri, new VBRequestOptions({ctxProject: projectCtx.getProject()})).subscribe();
    }

    getShowFlags(): boolean {
        if (VBContext.getWorkingProjectCtx() != null) {
            return VBContext.getWorkingProjectCtx().getProjectPreferences().showFlags;
        } else {
            return VBContext.getSystemSettings().showFlags;
        }
    }
    setShowFlags(show: boolean) {
        VBContext.getWorkingProjectCtx().getProjectPreferences().showFlags = show;
        this.eventHandler.showFlagChangedEvent.emit(show);
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.showFlags, show).subscribe();
    }

    setProjectTheme(theme: number) {
        VBContext.getWorkingProjectCtx().getProjectPreferences().projectThemeId = theme;
        this.eventHandler.themeChangedEvent.emit(theme);
        let value = (theme == 0) ? null : theme+""; //theme 0 is the default one, so remove the preference
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.projectTheme, value).subscribe();
    }

    setRenderingLanguagesPreference(languages: string[]) {
        let value: string = (languages.length == 0) ? null : languages.join(",");
        this.settingsService.storeSetting(ExtensionPointID.RENDERING_ENGINE_ID, Scope.PROJECT_USER, SettingsEnum.languages, value).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().renderingLanguagesPreference = languages;
    }

    setEditingLanguage(lang: string) {
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.editingLanguage, lang).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().editingLanguage = lang;
    }

    setValueFilterLanguages(filter: ValueFilterLanguages) {
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.filterValueLanguages, filter).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().filterValueLang = filter;
    }

    setNotificationStatus(status: NotificationStatus) {
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.notificationsStatus, status).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().notificationStatus = status;
        this.eventHandler.notificationStatusChangedEvent.emit();
    }

    //class tree settings
    setClassTreePreferences(clsTreePref: ClassTreePreference) {
        VBContext.getWorkingProjectCtx().getProjectPreferences().classTreePreferences = clsTreePref;
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.classTree, clsTreePref).subscribe();

    }

    //instance list settings
    setInstanceListPreferences(instListPref: InstanceListPreference) {
        let oldInstListPref = VBContext.getWorkingProjectCtx().getProjectPreferences().instanceListPreferences;
        if (oldInstListPref.safeToGoLimit != instListPref.safeToGoLimit) {
            instListPref.safeToGoMap = {}; //changing the limit invalidated the safe => reset the map
        }
        VBContext.getWorkingProjectCtx().getProjectPreferences().instanceListPreferences = instListPref;
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.instanceList, instListPref).subscribe();
    }

    //concept tree settings
    setConceptTreePreferences(concTreePrefs: ConceptTreePreference) {
        let oldConcTreePrefs = VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences;
        if (oldConcTreePrefs.safeToGoLimit != concTreePrefs.safeToGoLimit) {
            concTreePrefs.safeToGoMap = {}; //changing the limit invalidated the safe => reset the map
        }
        VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences = concTreePrefs;
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.conceptTree, concTreePrefs).subscribe();
    }

    //lex entry list settings
    setLexicalEntryListPreferences(lexEntryListPrefs: LexicalEntryListPreference) {
        let oldLexEntryListPrefs = VBContext.getWorkingProjectCtx().getProjectPreferences().lexEntryListPreferences;
        if (oldLexEntryListPrefs.safeToGoLimit != lexEntryListPrefs.safeToGoLimit) {
            lexEntryListPrefs.safeToGoMap = {}; //changing the limit invalidated the safe => reset the map
        }
        VBContext.getWorkingProjectCtx().getProjectPreferences().lexEntryListPreferences = lexEntryListPrefs;
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.lexEntryList, lexEntryListPrefs).subscribe();
    }

    //Res view settings
    setResourceViewPreferences(resViewPrefs: ResourceViewPreference) {
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences = resViewPrefs;
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.resourceView, resViewPrefs).subscribe();
        /* an empty resViewPartitionFilter should always be {}, anyway in order to write a null value and exploit the fallback-to-defaults mechanism, 
        it can be set to null serverside. In such case once the setting has been stored, the preference is re-initialized to {} */
        if (resViewPrefs.resViewPartitionFilter == null) {
            resViewPrefs.resViewPartitionFilter = {};
        }
    }

    refreshResourceViewPartitionFilter(): Observable<void> { //refreshed the cached rv partition filter
        return this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER).pipe(
            map(settings => {
                let resViewSettings: ResourceViewPreference = settings.getPropertyValue(SettingsEnum.resourceView);
                let filter: PartitionFilterPreference = {}
                if (resViewSettings != null && resViewSettings.resViewPartitionFilter != null) {
                    filter = resViewSettings.resViewPartitionFilter;
                }
                VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.resViewPartitionFilter = filter;
            })
        );
    }

    //Graph settings
    setGraphViewPartitionFilter(pref: PartitionFilterPreference) {
        VBContext.getWorkingProjectCtx().getProjectPreferences().graphViewPartitionFilter = pref;
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.graphViewPartitionFilter, pref).subscribe();
    }
    setHideLiteralGraphNodes(hide: boolean) {
        VBContext.getWorkingProjectCtx().getProjectPreferences().hideLiteralGraphNodes = hide;
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.hideLiteralGraphNodes, hide).subscribe();
    }

    /* =============================
    =========== BINDINGS ===========
    ============================= */

    initProjectUserBindings(projectCtx: ProjectContext): Observable<void> {
        return this.adminService.getProjectUserBinding(projectCtx.getProject().getName(), VBContext.getLoggedUser().getEmail()).pipe(
            map(pub => {
                projectCtx.setProjectUserBinding(pub);
            })
        );
    }


    /* =============================
    =========== SETTINGS ===========
    ============================= */

    initStartupSystemSettings() {
        this.settingsService.getStartupSettings().subscribe(
            settings => {
                let systemSettings: SystemSettings = VBContext.getSystemSettings();
                systemSettings.experimentalFeaturesEnabled = settings.getPropertyValue(SettingsEnum.experimentalFeaturesEnabled);
                systemSettings.privacyStatementAvailable = settings.getPropertyValue(SettingsEnum.privacyStatementAvailable);
                systemSettings.showFlags = settings.getPropertyValue(SettingsEnum.showFlags);
                systemSettings.homeContent = settings.getPropertyValue(SettingsEnum.homeContent);
                let systemLanguages: Language[] = settings.getPropertyValue(SettingsEnum.languages);
                Languages.sortLanguages(systemLanguages);
                Languages.setSystemLanguages(systemLanguages);
            }
        )
    }

    setExperimentalFeaturesEnabled(enabled: boolean) {
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM, SettingsEnum.experimentalFeaturesEnabled, enabled).subscribe();
        VBContext.getSystemSettings().experimentalFeaturesEnabled = enabled;
    }

    setHomeContent(homeContent: string) {
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM, SettingsEnum.homeContent, homeContent).subscribe();
        VBContext.getSystemSettings().homeContent = homeContent;
    }

    isPrivacyStatementAvailable(): boolean {
        return VBContext.getSystemSettings().privacyStatementAvailable;
    }

    initProjectSettings(projectCtx: ProjectContext): Observable<any> {

        let projectSettings: ProjectSettings = projectCtx.getProjectSettings();
        return this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, VBRequestOptions.getRequestOptions(projectCtx)).pipe(
            map(settings => {
                let langsValue: Language[] = settings.getPropertyValue(SettingsEnum.languages);
                projectSettings.projectLanguagesSetting = langsValue;
                Languages.sortLanguages(projectSettings.projectLanguagesSetting);

                let labelClashModeValue = settings.getPropertyValue(SettingsEnum.labelClashMode);
                if (labelClashModeValue != null && labelClashModeValue in PrefLabelClashMode) { //if not null and valid enum
                    projectSettings.prefLabelClashMode = labelClashModeValue;
                }
            })
        )
    }

    
    /* =============================
    ==== PREFERENCES IN COOKIES ====
    ============================= */

    /**
     * Some resource view preference are stored as cookie, not server-side preference. Here they are initialized
     * @param projectPreferences 
     */
    initResourceViewPreferenceCookie(projectPreferences: ProjectPreferences) {
        let rvPrefs: ResourceViewPreference = projectPreferences.resViewPreferences;
        //inference
        let inferenceCookie = Cookie.getCookie(Cookie.RES_VIEW_INCLUDE_INFERENCE);
        if (inferenceCookie != null) {
            rvPrefs.inference = inferenceCookie == "true"; //default false
        }
        //rendering
        let renderingCookie = Cookie.getCookie(Cookie.RES_VIEW_RENDERING);
        if (renderingCookie != null) {
            rvPrefs.rendering = renderingCookie != "false"; //default true
        }
        //mode
        let modeCookie = Cookie.getCookie(Cookie.RES_VIEW_MODE);
        if (modeCookie in ResourceViewMode) {
            rvPrefs.mode = <ResourceViewMode>modeCookie;
        }
        //tab sync
        let syncTabsCookie: string = Cookie.getCookie(Cookie.RES_VIEW_TAB_SYNCED);
        if (syncTabsCookie != null) {
            rvPrefs.syncTabs = syncTabsCookie == "true"; //default false
        }
        //display img
        let displayImgCookie = Cookie.getCookie(Cookie.RES_VIEW_DISPLAY_IMG);
        if (displayImgCookie != null) {
            rvPrefs.displayImg = displayImgCookie == "true"; //default false
        }
        //show deprecated
        let showDeprecatedCookie = Cookie.getCookie(Cookie.RES_VIEW_SHOW_DEPRECATED);
        if (showDeprecatedCookie != null) {
            rvPrefs.showDeprecated = showDeprecatedCookie != "false"; //default true
        }
        //show datatype badge
        let showDatatypeBadgeCookie = Cookie.getCookie(Cookie.RES_VIEW_SHOW_DATATYPE_BADGE);
        if (showDatatypeBadgeCookie != null) {
            rvPrefs.showDatatypeBadge = showDatatypeBadgeCookie == "true"; //default false
        }
    }

    /**
     * ResView Inference
     */
    setInferenceInResourceView(showInferred: boolean) {
        Cookie.setCookie(Cookie.RES_VIEW_INCLUDE_INFERENCE, showInferred + "", 365*10);
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.inference = showInferred;
    }

    /**
     * ResView Rendering
     */
    setRenderingInResourceView(rendering: boolean) {
        Cookie.setCookie(Cookie.RES_VIEW_RENDERING, rendering + "", 365*10);
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.rendering = rendering;
    }

    /**
     * ResView mode
     */
    setResourceViewMode(mode: ResourceViewMode) {
        Cookie.setCookie(Cookie.RES_VIEW_MODE, mode, 365*10);
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.mode = mode;
    }
    /**
     * ResView Tab sync
     */
    setResourceViewTabSync(sync: boolean) {
        Cookie.setCookie(Cookie.RES_VIEW_TAB_SYNCED, sync + "", 365*10);
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.syncTabs = sync;
    }

    /**
     * ResView display img
     */
    setResourceViewDisplayImg(display: boolean) {
        Cookie.setCookie(Cookie.RES_VIEW_DISPLAY_IMG, display + "");
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.displayImg = display;
    }

    /**
     * ResView show deprecated linked resources
     * @param display 
     */
    setShowDeprecatedInResView(show: boolean) {
        Cookie.setCookie(Cookie.RES_VIEW_SHOW_DEPRECATED, show + "");
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.showDeprecated = show;
    }

    setShowDatatypeBadge(show: boolean) {
        Cookie.setCookie(Cookie.RES_VIEW_SHOW_DEPRECATED, show + "");
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.showDatatypeBadge = show;
    }

    /**
     * Tree/list Show deprecated
     */
    setShowDeprecated(showDeprecated: boolean) {
        Cookie.setCookie(Cookie.SHOW_DEPRECATED, showDeprecated + "", 365*10);
    }
    getShowDeprecated(): boolean {
        let cookieValue: string = Cookie.getCookie(Cookie.SHOW_DEPRECATED);
        return cookieValue != "false"; //default true
    }

    
    private initSearchSettingsCookie(preferences: ProjectPreferences) {
        let searchModeCookie: string = Cookie.getCookie(Cookie.SEARCH_STRING_MATCH_MODE);
        if (searchModeCookie != null) {
            preferences.searchSettings.stringMatchMode = <SearchMode>searchModeCookie;
        }
        let useUriCookie: string = Cookie.getCookie(Cookie.SEARCH_USE_URI);
        if (useUriCookie != null) {
            preferences.searchSettings.useURI = useUriCookie == "true";
        }
        let useLocalNameCookie: string = Cookie.getCookie(Cookie.SEARCH_USE_LOCAL_NAME);
        if (useLocalNameCookie != null) {
            preferences.searchSettings.useLocalName = useLocalNameCookie == "true";
        }
        let useNotesCookie: string = Cookie.getCookie(Cookie.SEARCH_USE_NOTES);
        if (useNotesCookie != null) {
            preferences.searchSettings.useNotes = useNotesCookie == "true";
        }
        let restrictSchemesCookie: string = Cookie.getCookie(Cookie.SEARCH_CONCEPT_SCHEME_RESTRICTION);
        if (restrictSchemesCookie != null) {
            preferences.searchSettings.restrictActiveScheme = restrictSchemesCookie == "true";
        }
        let extendAllIndividualsCookie: string = Cookie.getCookie(Cookie.SEARCH_EXTEND_ALL_INDIVIDUALS);
        if (restrictSchemesCookie != null) {
            preferences.searchSettings.extendToAllIndividuals = extendAllIndividualsCookie == "true";
        }
    }

    setSearchSettings(projectCtx: ProjectContext, settings: SearchSettings) {
        let oldSearchSettings: SearchSettings = projectCtx.getProjectPreferences().searchSettings;

        Cookie.setCookie(Cookie.SEARCH_STRING_MATCH_MODE, settings.stringMatchMode, 365*10);
        Cookie.setCookie(Cookie.SEARCH_USE_URI, settings.useURI+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_USE_LOCAL_NAME, settings.useLocalName+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_USE_NOTES, settings.useNotes+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_CONCEPT_SCHEME_RESTRICTION, settings.restrictActiveScheme+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_EXTEND_ALL_INDIVIDUALS, settings.extendToAllIndividuals+"", 365*10);

        let changed: boolean = oldSearchSettings.languages != settings.languages ||
            oldSearchSettings.languages != settings.languages ||
            oldSearchSettings.restrictLang != settings.restrictLang ||
            oldSearchSettings.includeLocales != settings.includeLocales ||
            oldSearchSettings.useAutocompletion != settings.useAutocompletion;

        if (changed) {
            projectCtx.getProjectPreferences().searchSettings = settings;
            //the properties stored as cookie (e.g. useURI, useLocalName, ...) will be simply ignored server side, so I can pass here the whole searchSettings object
            this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.searchSettings, settings, 
                new VBRequestOptions({ ctxProject: projectCtx.getProject() })).subscribe();
        }
        this.eventHandler.searchPrefsUpdatedEvent.emit(projectCtx.getProject());
    }

    //EVENT HANDLER
    /**
     * In case of resource renamed, check if the resource is a current active scheme, in case update the preference
     * @param oldResource 
     * @param newResource 
     */
    private onResourceRenamed(oldResource: ARTResource, newResource: ARTResource) {
        let activeSchemes: ARTURIResource[] = VBContext.getWorkingProjectCtx().getProjectPreferences().activeSchemes;
        for (let i = 0; i < activeSchemes.length; i++) {
            if (activeSchemes[i].getNominalValue() == oldResource.getNominalValue()) {
                activeSchemes[i].setURI(newResource.getNominalValue());
                this.setActiveSchemes(VBContext.getWorkingProjectCtx(), activeSchemes);
                break;
            }
        }
    }

}