import { Injectable } from '@angular/core';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { Language, Languages } from '../models/LanguagesCountries';
import { ExtensionPointID, Scope } from '../models/Plugins';
import { AuthServiceMode, ClassTreePreference, ConceptTreePreference, CustomTreeSettings, InstanceListPreference, LexicalEntryListPreference, NotificationStatus, PartitionFilterPreference, PreferencesUtils, PrefLabelClashMode, ProjectPreferences, ProjectSettings, ResourceViewMode, ResourceViewPreference, ResourceViewProjectSettings, SearchMode, SearchSettings, SettingsEnum, SystemSettings, ValueFilterLanguages } from '../models/Properties';
import { ResViewPartition } from '../models/ResourceView';
import { Sheet2RdfSettings } from '../models/Sheet2RDF';
import { AdministrationServices } from '../services/administrationServices';
import { SettingsServices } from '../services/settingsServices';
import { Cookie } from '../utils/Cookie';
import { VBEventHandler } from '../utils/VBEventHandler';
import { VBRequestOptions } from './HttpManager';
import { ProjectContext, VBContext } from './VBContext';

@Injectable()
export class VBProperties {

    private eventSubscriptions: Subscription[] = [];

    constructor(private adminService: AdministrationServices, private settingsService: SettingsServices,
        private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: { oldResource: ARTResource, newResource: ARTResource }) => this.onResourceRenamed(data.oldResource, data.newResource)
        ));
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach(s => s.unsubscribe());
    }

    /* =============================
    ========= PREFERENCES ==========
    ============================= */

    /**
     * To call each time the user change project
     * @param projectCtx
     * @param externalProject true when this is invoked for the initialization of project preference for an external project
     *  (so, for example, when browing external project resources there's no need to change the app theme since the main project is not the one initializing)
     */
    initUserProjectPreferences(projectCtx: ProjectContext, externalProject?: boolean): Observable<any> {
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
                if (!externalProject) {
                    this.eventHandler.themeChangedEvent.emit(projectPreferences.projectThemeId);
                }

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
                    graphPartitionFilterPref = {};
                    for (let role in RDFResourceRolesEnum) {
                        graphPartitionFilterPref[role] = [ResViewPartition.lexicalizations];
                    }
                }
                projectPreferences.graphViewPartitionFilter = graphPartitionFilterPref;

                projectPreferences.hideLiteralGraphNodes = settings.getPropertyValue(SettingsEnum.hideLiteralGraphNodes);

                let structurePanelFilter: RDFResourceRolesEnum[] = settings.getPropertyValue(SettingsEnum.structurePanelFilter);
                if (structurePanelFilter != null) {
                    projectPreferences.structurePanelFilter = structurePanelFilter;
                }

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

                //custom tree
                projectPreferences.customTreeSettings = new CustomTreeSettings();
                let cTreeSetting = settings.getPropertyValue(SettingsEnum.customTree);
                if (cTreeSetting != null) {
                    PreferencesUtils.mergePreference(projectPreferences.customTreeSettings, cTreeSetting);
                }

                //search settings
                projectPreferences.searchSettings = new SearchSettings();
                let searchSettings: SearchSettings = settings.getPropertyValue(SettingsEnum.searchSettings);
                if (searchSettings != null) {
                    PreferencesUtils.mergePreference(projectPreferences.searchSettings, searchSettings);
                }
                this.initSearchSettingsCookie(projectPreferences); //other settings stored in cookies

                //s2rdf
                projectPreferences.sheet2RdfSettings = new Sheet2RdfSettings();
                let s2rdfSettings: Sheet2RdfSettings = settings.getPropertyValue(SettingsEnum.sheet2rdfSettings);
                if (s2rdfSettings != null) {
                    PreferencesUtils.mergePreference(projectPreferences.sheet2RdfSettings, s2rdfSettings);
                }

                //notifications
                let notificationStatusSetting = settings.getPropertyValue(SettingsEnum.notificationsStatus);
                if (notificationStatusSetting != null) {
                    projectPreferences.notificationStatus = notificationStatusSetting;
                }
            })
        );
        // this is called separately since it is about a different plugin
        let getPUSettingsRenderingEngine = this.settingsService.getSettings(ExtensionPointID.RENDERING_ENGINE_ID, Scope.PROJECT_USER, VBRequestOptions.getRequestOptions(projectCtx)).pipe(
            map(settings => {
                projectCtx.getProjectPreferences().renderingLanguagesPreference = settings.getPropertyValue(SettingsEnum.languages).split(",");
            })
        );
        return forkJoin([
            getPUSettingsRenderingEngine,
            getPUSettingsCore,
        ]);
    }

    setActiveSchemes(projectCtx: ProjectContext, schemes: ARTURIResource[]): Observable<void> {
        if (schemes == null) {
            projectCtx.getProjectPreferences().activeSchemes = [];
        } else {
            projectCtx.getProjectPreferences().activeSchemes = schemes;
        }
        this.eventHandler.schemeChangedEvent.emit({ schemes: schemes, project: projectCtx.getProject() });
        let schemesPropValue: string[] = schemes.map(s => s.toNT());
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.activeSchemes, schemesPropValue, new VBRequestOptions({ ctxProject: projectCtx.getProject() }));
    }

    setActiveLexicon(projectCtx: ProjectContext, lexicon: ARTURIResource): Observable<void> {
        projectCtx.getProjectPreferences().activeLexicon = lexicon;
        this.eventHandler.lexiconChangedEvent.emit({ lexicon: lexicon, project: projectCtx.getProject() });
        let lexiconUri: string = lexicon != null ? lexicon.toNT() : null;
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.activeLexicon, lexiconUri, new VBRequestOptions({ ctxProject: projectCtx.getProject() }));
    }

    getShowFlags(): boolean {
        if (VBContext.getWorkingProjectCtx() != null) {
            return VBContext.getWorkingProjectCtx().getProjectPreferences().showFlags;
        } else {
            return VBContext.getSystemSettings().showFlags;
        }
    }
    setShowFlags(show: boolean): Observable<void> {
        VBContext.getWorkingProjectCtx().getProjectPreferences().showFlags = show;
        this.eventHandler.showFlagChangedEvent.emit(show);
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.showFlags, show);
    }

    setProjectTheme(theme: number): Observable<void> {
        VBContext.getWorkingProjectCtx().getProjectPreferences().projectThemeId = theme;
        this.eventHandler.themeChangedEvent.emit(theme);
        let value = (theme == 0) ? null : theme + ""; //theme 0 is the default one, so remove the preference
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.projectTheme, value);
    }

    setRenderingLanguagesPreference(languages: string[]): Observable<void> {
        let value: string = (languages.length == 0) ? null : languages.join(",");
        VBContext.getWorkingProjectCtx().getProjectPreferences().renderingLanguagesPreference = languages;
        return this.settingsService.storeSetting(ExtensionPointID.RENDERING_ENGINE_ID, Scope.PROJECT_USER, SettingsEnum.languages, value);
    }

    setEditingLanguage(lang: string): Observable<void> {
        VBContext.getWorkingProjectCtx().getProjectPreferences().editingLanguage = lang;
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.editingLanguage, lang);
    }

    setValueFilterLanguages(filter: ValueFilterLanguages): Observable<void> {
        VBContext.getWorkingProjectCtx().getProjectPreferences().filterValueLang = filter;
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.filterValueLanguages, filter);
    }

    setNotificationStatus(status: NotificationStatus): Observable<void> {
        VBContext.getWorkingProjectCtx().getProjectPreferences().notificationStatus = status;
        this.eventHandler.notificationStatusChangedEvent.emit();
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.notificationsStatus, status);
    }

    setStructurePanelFilter(structurePanelFilter: RDFResourceRolesEnum[]): Observable<void> {
        VBContext.getWorkingProjectCtx().getProjectPreferences().structurePanelFilter = structurePanelFilter;
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.structurePanelFilter, structurePanelFilter);
    }

    //class tree settings
    setClassTreePreferences(clsTreePref: ClassTreePreference): Observable<void> {
        VBContext.getWorkingProjectCtx().getProjectPreferences().classTreePreferences = clsTreePref;
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.classTree, clsTreePref);
    }

    //instance list settings
    setInstanceListPreferences(instListPref: InstanceListPreference): Observable<void> {
        let oldInstListPref = VBContext.getWorkingProjectCtx().getProjectPreferences().instanceListPreferences;
        if (oldInstListPref.safeToGoLimit != instListPref.safeToGoLimit) {
            instListPref.safeToGoMap = {}; //changing the limit invalidated the safe => reset the map
        }
        VBContext.getWorkingProjectCtx().getProjectPreferences().instanceListPreferences = instListPref;
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.instanceList, instListPref);
    }

    //concept tree settings
    setConceptTreePreferences(concTreePrefs: ConceptTreePreference): Observable<void> {
        let oldConcTreePrefs = VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences;
        if (oldConcTreePrefs.safeToGoLimit != concTreePrefs.safeToGoLimit) {
            concTreePrefs.safeToGoMap = {}; //changing the limit invalidated the safe => reset the map
        }
        VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences = concTreePrefs;
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.conceptTree, concTreePrefs);
    }

    //lex entry list settings
    setLexicalEntryListPreferences(lexEntryListPrefs: LexicalEntryListPreference): Observable<void> {
        let oldLexEntryListPrefs = VBContext.getWorkingProjectCtx().getProjectPreferences().lexEntryListPreferences;
        if (oldLexEntryListPrefs.safeToGoLimit != lexEntryListPrefs.safeToGoLimit) {
            lexEntryListPrefs.safeToGoMap = {}; //changing the limit invalidated the safe => reset the map
        }
        VBContext.getWorkingProjectCtx().getProjectPreferences().lexEntryListPreferences = lexEntryListPrefs;
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.lexEntryList, lexEntryListPrefs);
    }

    setCustomTreeSettings(customTreeSettings: CustomTreeSettings): Observable<void> {
        VBContext.getWorkingProjectCtx().getProjectPreferences().customTreeSettings = customTreeSettings;
        this.eventHandler.customTreeSettingsChangedEvent.emit();
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.customTree, customTreeSettings);
    }

    //Res view settings
    setResourceViewPreferences(resViewPrefs: ResourceViewPreference): Observable<void> {
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences = resViewPrefs;
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.resourceView, resViewPrefs).pipe(
            tap(() => {
                /* an empty resViewPartitionFilter should always be {}, anyway in order to write a null value and exploit the fallback-to-defaults mechanism, 
                it can be set to null serverside. In such case once the setting has been stored, the preference is re-initialized to {} */
                if (resViewPrefs.resViewPartitionFilter == null) {
                    resViewPrefs.resViewPartitionFilter = {};
                }
            })
        );
    }

    refreshResourceViewPartitionFilter(): Observable<void> { //refreshed the cached rv partition filter
        return this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER).pipe(
            map(settings => {
                let resViewSettings: ResourceViewPreference = settings.getPropertyValue(SettingsEnum.resourceView);
                let filter: PartitionFilterPreference = {};
                if (resViewSettings != null && resViewSettings.resViewPartitionFilter != null) {
                    filter = resViewSettings.resViewPartitionFilter;
                }
                VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.resViewPartitionFilter = filter;
            })
        );
    }

    //Graph settings
    setGraphViewPartitionFilter(pref: PartitionFilterPreference): Observable<void> {
        VBContext.getWorkingProjectCtx().getProjectPreferences().graphViewPartitionFilter = pref;
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.graphViewPartitionFilter, pref);
    }
    setHideLiteralGraphNodes(hide: boolean): Observable<void> {
        VBContext.getWorkingProjectCtx().getProjectPreferences().hideLiteralGraphNodes = hide;
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.hideLiteralGraphNodes, hide);
    }

    /* =============================
    =========== BINDINGS ===========
    ============================= */

    initProjectUserBindings(projectCtx: ProjectContext): Observable<void> {
        return this.adminService.getProjectUserBinding(projectCtx.getProject(), VBContext.getLoggedUser().getEmail()).pipe(
            map(pub => {
                projectCtx.setProjectUserBinding(pub);
            })
        );
    }


    /* =============================
    =========== SETTINGS ===========
    ============================= */

    initStartupSystemSettings(): Observable<void> {
        return this.settingsService.getStartupSettings().pipe(
            map(settings => {
                let systemSettings: SystemSettings = new SystemSettings();
                systemSettings.experimentalFeaturesEnabled = settings.getPropertyValue(SettingsEnum.experimentalFeaturesEnabled);
                systemSettings.privacyStatementAvailable = settings.getPropertyValue(SettingsEnum.privacyStatementAvailable);
                systemSettings.showFlags = settings.getPropertyValue(SettingsEnum.showFlags);
                systemSettings.homeContent = settings.getPropertyValue(SettingsEnum.homeContent);
                systemSettings.emailVerification = settings.getPropertyValue(SettingsEnum.emailVerification);
                let systemLanguages: Language[] = settings.getPropertyValue(SettingsEnum.languages);
                Languages.sortLanguages(systemLanguages);
                systemSettings.languages = systemLanguages;
                let authServiceValue = settings.getPropertyValue(SettingsEnum.authService);
                if (authServiceValue in AuthServiceMode) {
                    systemSettings.authService = authServiceValue;
                }
                VBContext.setSystemSettings(systemSettings);
            })
        );
    }

    setExperimentalFeaturesEnabled(enabled: boolean): Observable<void> {
        VBContext.getSystemSettings().experimentalFeaturesEnabled = enabled;
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM, SettingsEnum.experimentalFeaturesEnabled, enabled);
    }

    setEmailVerification(enabled: boolean): Observable<void> {
        VBContext.getSystemSettings().emailVerification = enabled;
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM, SettingsEnum.emailVerification, enabled);
    }

    setHomeContent(homeContent: string): Observable<void> {
        VBContext.getSystemSettings().homeContent = homeContent;
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM, SettingsEnum.homeContent, homeContent);
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

                projectSettings.resourceView = new ResourceViewProjectSettings();
                let rvSettings: ResourceViewProjectSettings = settings.getPropertyValue(SettingsEnum.resourceView);
                if (rvSettings != null) {
                    PreferencesUtils.mergePreference(projectSettings.resourceView, rvSettings);
                }

                projectSettings.timeMachineEnabled = settings.getPropertyValue(SettingsEnum.timeMachineEnabled);
            })
        );
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
        let sortByRenderingCookie = Cookie.getCookie(Cookie.RES_VIEW_SORT_BY_RENDERING);
        if (sortByRenderingCookie != null) {
            rvPrefs.sortByRendering = sortByRenderingCookie == "true";
        }
    }

    /**
     * ResView Inference
     */
    setInferenceInResourceView(showInferred: boolean) {
        Cookie.setCookie(Cookie.RES_VIEW_INCLUDE_INFERENCE, showInferred + "");
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.inference = showInferred;
    }

    /**
     * ResView Rendering
     */
    setRenderingInResourceView(rendering: boolean) {
        Cookie.setCookie(Cookie.RES_VIEW_RENDERING, rendering + "");
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.rendering = rendering;
    }

    /**
     * ResView mode
     */
    setResourceViewMode(mode: ResourceViewMode) {
        Cookie.setCookie(Cookie.RES_VIEW_MODE, mode);
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.mode = mode;
    }
    /**
     * ResView Tab sync
     */
    setResourceViewTabSync(sync: boolean) {
        Cookie.setCookie(Cookie.RES_VIEW_TAB_SYNCED, sync + "");
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

    setSortByRendering(sort: boolean) {
        Cookie.setCookie(Cookie.RES_VIEW_SORT_BY_RENDERING, sort + "");
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.sortByRendering = sort;
    }

    /**
     * Tree/list Show deprecated
     */
    setShowDeprecated(showDeprecated: boolean) {
        Cookie.setCookie(Cookie.SHOW_DEPRECATED, showDeprecated + "");
        this.eventHandler.showDeprecatedChangedEvent.emit(showDeprecated);
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

        Cookie.setCookie(Cookie.SEARCH_STRING_MATCH_MODE, settings.stringMatchMode);
        Cookie.setCookie(Cookie.SEARCH_USE_URI, settings.useURI + "");
        Cookie.setCookie(Cookie.SEARCH_USE_LOCAL_NAME, settings.useLocalName + "");
        Cookie.setCookie(Cookie.SEARCH_USE_NOTES, settings.useNotes + "");
        Cookie.setCookie(Cookie.SEARCH_CONCEPT_SCHEME_RESTRICTION, settings.restrictActiveScheme + "");
        Cookie.setCookie(Cookie.SEARCH_EXTEND_ALL_INDIVIDUALS, settings.extendToAllIndividuals + "");

        let changed: boolean = oldSearchSettings.languages != settings.languages ||
            oldSearchSettings.languages != settings.languages ||
            oldSearchSettings.restrictLang != settings.restrictLang ||
            oldSearchSettings.includeLocales != settings.includeLocales ||
            oldSearchSettings.useAutocompletion != settings.useAutocompletion;

        if (changed) {
            //the properties stored as cookie (e.g. useURI, useLocalName, ...) will be simply ignored server side, so I can pass here the whole searchSettings object
            this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, SettingsEnum.searchSettings, settings,
                new VBRequestOptions({ ctxProject: projectCtx.getProject() })).subscribe();
        }
        projectCtx.getProjectPreferences().searchSettings = settings;
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
                this.setActiveSchemes(VBContext.getWorkingProjectCtx(), activeSchemes).subscribe();
                break;
            }
        }
    }

}