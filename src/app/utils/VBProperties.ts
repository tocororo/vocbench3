import { Injectable } from '@angular/core';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { Language, Languages } from '../models/LanguagesCountries';
import { ExtensionPointID, Scope } from '../models/Plugins';
import { ClassTreeFilter, ClassTreePreference, ConceptTreePreference, ConceptTreeVisualizationMode, InstanceListPreference, InstanceListVisualizationMode, LexEntryVisualizationMode, LexicalEntryListPreference, MultischemeMode, NotificationStatus, PartitionFilterPreference, PrefLabelClashMode, ProjectPreferences, ProjectSettings, Properties, ResourceViewMode, ResourceViewPreference, ResourceViewType, SearchMode, SearchSettings, SettingsEnum, ValueFilterLanguages } from '../models/Properties';
import { ResViewPartition } from '../models/ResourceView';
import { AdministrationServices } from '../services/administrationServices';
import { PreferencesSettingsServices } from '../services/preferencesSettingsServices';
import { SettingsServices } from '../services/settingsServices';
import { Cookie } from '../utils/Cookie';
import { VBEventHandler } from '../utils/VBEventHandler';
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
import { ModalType } from '../widget/modal/Modals';
import { VBRequestOptions } from './HttpManager';
import { ProjectContext, VBContext } from './VBContext';

@Injectable()
export class VBProperties {

    private eventSubscriptions: Subscription[] = [];

    constructor(private prefService: PreferencesSettingsServices, private adminService: AdministrationServices, private settingsService: SettingsServices,
        private basicModals: BasicModalServices, private eventHandler: VBEventHandler) {
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
                let resViewPreferences: ResourceViewPreference = settings.getPropertyValue(SettingsEnum.resourceView);
                if (resViewPreferences == null) {
                    resViewPreferences = new ResourceViewPreference();
                }
                projectPreferences.resViewPreferences = resViewPreferences;

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
                let classTreePreferences: ClassTreePreference = new ClassTreePreference(projectCtx.getProject());
                let clsTreeSettings: ClassTreePreference = settings.getPropertyValue(SettingsEnum.classTree);
                if (clsTreeSettings != null) { //the following is necessary due to the update to settings introduced in VB > 9.0 and the related update routine
                    classTreePreferences.showInstancesNumber = clsTreeSettings.showInstancesNumber;
                    if (clsTreeSettings.filter != null) classTreePreferences.filter = clsTreeSettings.filter;
                    if (clsTreeSettings.rootClassUri != null) classTreePreferences.rootClassUri = clsTreeSettings.rootClassUri;
                }
                projectPreferences.classTreePreferences = classTreePreferences;

                //instance list preferences
                let instanceListPreferences: InstanceListPreference = settings.getPropertyValue(SettingsEnum.instanceList);
                if (instanceListPreferences == null) {
                    instanceListPreferences = new InstanceListPreference();
                }
                projectPreferences.instanceListPreferences = instanceListPreferences;

                //concept tree preferences
                let conceptTreePreferences: ConceptTreePreference = settings.getPropertyValue(SettingsEnum.conceptTree); new ConceptTreePreference();
                if (conceptTreePreferences == null) {
                    conceptTreePreferences = new ConceptTreePreference();
                }
                projectPreferences.conceptTreePreferences = conceptTreePreferences;


                //lexical entry list preferences
                let lexEntryListPreferences: LexicalEntryListPreference = settings.getPropertyValue(SettingsEnum.lexEntryList);
                if (lexEntryListPreferences == null) {
                    lexEntryListPreferences =  new LexicalEntryListPreference();
                }
                projectPreferences.lexEntryListPreferences = lexEntryListPreferences;

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
                projectCtx.getProjectPreferences().projectLanguagesPreference = settings.getPropertyValue(SettingsEnum.languages).split(",");
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
        this.prefService.setActiveSchemes(schemes, new VBRequestOptions({ctxProject: projectCtx.getProject()})).subscribe();
    }

    setActiveLexicon(projectCtx: ProjectContext, lexicon: ARTURIResource) {
        projectCtx.getProjectPreferences().activeLexicon = lexicon;
        this.eventHandler.lexiconChangedEvent.emit({ lexicon: lexicon, project: projectCtx.getProject() });
        let lexiconUri: string = lexicon != null ? lexicon.getURI() : null;
        this.prefService.setPUSetting(Properties.pref_active_lexicon, lexiconUri, projectCtx.getProject()).subscribe();
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
        this.prefService.setPUSetting(Properties.pref_show_flags, show+"").subscribe()
    }

    setProjectTheme(theme: number) {
        VBContext.getWorkingProjectCtx().getProjectPreferences().projectThemeId = theme;
        this.eventHandler.themeChangedEvent.emit(theme);
        let value = (theme == 0) ? null : theme+""; //theme 0 is the default one, so remove the preference
        this.prefService.setPUSetting(Properties.pref_project_theme, value).subscribe();
    }

    setLanguagesPreference(languages: string[]) {
        let value: string = (languages.length == 0) ? null : languages.join(",");
        this.prefService.setPUSetting(Properties.pref_languages, value, null, ExtensionPointID.RENDERING_ENGINE_ID).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().projectLanguagesPreference = languages;
    }

    setEditingLanguage(lang: string) {
        this.prefService.setPUSetting(Properties.pref_editing_language, lang).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().editingLanguage = lang;
    }

    setValueFilterLanguages(filter: ValueFilterLanguages) {
        this.prefService.setPUSetting(Properties.pref_filter_value_languages, JSON.stringify(filter)).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().filterValueLang = filter;
    }

    setNotificationStatus(status: NotificationStatus) {
        this.prefService.setPUSetting(Properties.pref_notifications_status, status).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().notificationStatus = status;
        this.eventHandler.notificationStatusChangedEvent.emit();
    }

    //class tree settings
    setClassTreeFilter(filter: ClassTreeFilter) {
        this.prefService.setPUSetting(Properties.pref_class_tree_filter, JSON.stringify(filter)).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().classTreePreferences.filter = filter;
        this.eventHandler.classFilterChangedEvent.emit();
    }
    setClassTreeRoot(rootUri: string) {
        this.prefService.setPUSetting(Properties.pref_class_tree_root, rootUri).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().classTreePreferences.rootClassUri = rootUri;
    }
    setShowInstancesNumber(show: boolean) {
        VBContext.getWorkingProjectCtx().getProjectPreferences().classTreePreferences.showInstancesNumber = show;
        let value = show ? "true" : null;
        this.prefService.setPUSetting(Properties.pref_show_instances_number, value).subscribe()
    }

    //instance list settings
    setInstanceListVisualization(mode: InstanceListVisualizationMode) {
        this.prefService.setPUSetting(Properties.pref_instance_list_visualization, mode).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().instanceListPreferences.visualization = mode;
    }
    setInstanceLisSafeToGoLimit(limit: number) {
        this.prefService.setPUSetting(Properties.pref_instance_list_safe_to_go_limit, limit+"").subscribe();
        let instanceListPref = VBContext.getWorkingProjectCtx().getProjectPreferences().instanceListPreferences;
        instanceListPref.safeToGoLimit = limit;
        instanceListPref.safeToGoMap = {}; //changing the limit invalidated the safe => reset the map
    }

    //concept tree settings
    setMultischemeMode(mode: MultischemeMode) {
        this.prefService.setPUSetting(Properties.pref_concept_tree_multischeme_mode, mode).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences.multischemeMode = mode;
    }
    setConceptTreeSafeToGoLimit(limit: number) {
        this.prefService.setPUSetting(Properties.pref_concept_tree_safe_to_go_limit, limit+"").subscribe();
        let conceptTreePref = VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences; 
        conceptTreePref.safeToGoLimit = limit;
        conceptTreePref.safeToGoMap = {}; //changing the limit invalidated the safe => reset the map
    }
    setConceptTreeBaseBroaderProp(propUri: string) {
        this.prefService.setPUSetting(Properties.pref_concept_tree_base_broader_prop, propUri).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences.baseBroaderUri = propUri;
    }
    setConceptTreeBroaderProps(props: string[]) {
        let prefValue: string;
        if (props.length > 0) {
            prefValue = props.join(",")
        }
        this.prefService.setPUSetting(Properties.pref_concept_tree_broader_props, prefValue).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences.broaderProps = props;
    }
    setConceptTreeNarrowerProps(props: string[]) {
        let prefValue: string;
        if (props.length > 0) {
            prefValue = props.join(",")
        }
        this.prefService.setPUSetting(Properties.pref_concept_tree_narrower_props, prefValue).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences.narrowerProps = props;
    }
    setConceptTreeIncludeSubProps(include: boolean) {
        this.prefService.setPUSetting(Properties.pref_concept_tree_include_subprops, include+"").subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences.includeSubProps = include;
    }
    setConceptTreeSyncInverse(sync: boolean) {
        this.prefService.setPUSetting(Properties.pref_concept_tree_sync_inverse, sync+"").subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences.syncInverse = sync;
    }
    setConceptTreeVisualization(mode: ConceptTreeVisualizationMode) {
        this.prefService.setPUSetting(Properties.pref_concept_tree_visualization, mode).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences.visualization = mode;
    }

    //lex entry list settings
    setLexicalEntryListVisualization(mode: LexEntryVisualizationMode) {
        this.prefService.setPUSetting(Properties.pref_lex_entry_list_visualization, mode).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().lexEntryListPreferences.visualization = mode;
    }
    setLexicalEntryListSafeToGoLimit(limit: number) {
        this.prefService.setPUSetting(Properties.pref_lex_entry_list_safe_to_go_limit, limit+"").subscribe();
        let lexEntryListPref = VBContext.getWorkingProjectCtx().getProjectPreferences().lexEntryListPreferences;
        lexEntryListPref.safeToGoLimit = limit;
        lexEntryListPref.safeToGoMap = {}; //changing the limit invalidated the safe => reset the map
    }
    setLexicalEntryListIndexLenght(lenght: number) {
        this.prefService.setPUSetting(Properties.pref_lex_entry_list_index_lenght, lenght+"").subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().lexEntryListPreferences.indexLength = lenght;
    }

    //Res view settings
    setResourceViewConceptType(type: ResourceViewType) {
        this.prefService.setPUSetting(Properties.pref_res_view_default_concept_type, type).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.defaultConceptType = type;
    }

    setResourceViewLexEntryType(type: ResourceViewType) {
        this.prefService.setPUSetting(Properties.pref_res_view_default_lexentry_type, type).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.defaultLexEntryType = type;
    }

    setResourceViewPartitionFilter(pref: PartitionFilterPreference) {
        let value = (pref != null) ? JSON.stringify(pref) : null;
        this.prefService.setPUSetting(Properties.pref_res_view_partition_filter, value).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.resViewPartitionFilter = pref;
    }
    refreshResourceViewPartitionFilter(): Observable<void> { //refreshed the cached rv partition filter
        return this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER).pipe(
            map(settings => {
                let resViewSettings: ResourceViewPreference = settings.getPropertyValue(SettingsEnum.resourceView);
                let filter: PartitionFilterPreference
                if (resViewSettings != null) {
                    filter = resViewSettings.resViewPartitionFilter;
                }
                VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.resViewPartitionFilter = filter;
            })
        );
    }

    //Graph settings
    setGraphViewPartitionFilter(pref: PartitionFilterPreference) {
        let value = (pref != null) ? JSON.stringify(pref) : null;
        this.prefService.setPUSetting(Properties.pref_graph_view_partition_filter, value).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().graphViewPartitionFilter = pref;
    }
    setHideLiteralGraphNodes(show: boolean) {
        VBContext.getWorkingProjectCtx().getProjectPreferences().hideLiteralGraphNodes = show;
        this.prefService.setPUSetting(Properties.pref_hide_literal_graph_nodes, show+"").subscribe();
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
        this.prefService.getStartupSystemSettings().subscribe(
            stResp => {
                //experimental_features_enabled
                VBContext.getSystemSettings().experimentalFeaturesEnabled = stResp[Properties.setting_experimental_features_enabled]
                //privacy_statement_available
                VBContext.getSystemSettings().privacyStatementAvailable = stResp[Properties.privacy_statement_available]
                //show_flags
                VBContext.getSystemSettings().showFlags = stResp[Properties.pref_show_flags];
                //languages
                try {
                    let systemLanguages = <Language[]>JSON.parse(stResp[Properties.setting_languages]);
                    Languages.sortLanguages(systemLanguages);
                    Languages.setSystemLanguages(systemLanguages);
                } catch (err) {
                    this.basicModals.alert({key:"STATUS.ERROR"}, {key:"MESSAGES.SYS_LANGUAGES_PROP_PARSING_ERR", params:{propName:Properties.setting_languages}}, ModalType.error);
                }
                //home content
                VBContext.getSystemSettings().homeContent = stResp[Properties.setting_home_content];
            }
        )
        // this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM).subscribe(
        //     settings => {

        //         VBContext.getSystemSettings().experimentalFeaturesEnabled = settings.getPropertyValue(SettingsEnum.experimentalFeaturesEnabled);
        //         //privacy_statement_available
        //         VBContext.getSystemSettings().privacyStatementAvailable = settings.getPropertyValue(SettingsEnum.privacyStatementAvailable);
        //         //show_flags
        //         VBContext.getSystemSettings().showFlags = settings.getPropertyValue(SettingsEnum.showFlags);
        //         //home content
        //         VBContext.getSystemSettings().homeContent = settings.getPropertyValue(SettingsEnum.homeContent);
        //         /**
        //          * languages setting was taken from getStartupSystemSettings but it was not into system settings file, it was in the project-settings-defaults
        //          * so update here when the service for retrieving the default will be available
        //          */
        //         //languages
        //         let systemLanguages: Language[] = settings.getPropertyValue(SettingsEnum.languages);
        //         Languages.sortLanguages(systemLanguages);
        //         Languages.setSystemLanguages(systemLanguages);
        //     }
        // )
    }

    setExperimentalFeaturesEnabled(enabled: boolean) {
        this.prefService.setSystemSetting(Properties.setting_experimental_features_enabled, enabled+"").subscribe();
        VBContext.getSystemSettings().experimentalFeaturesEnabled = enabled;
    }

    setHomeContent(homeContent: string) {
        this.prefService.setSystemSetting(Properties.setting_home_content, homeContent).subscribe();
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
        let projectPreferences: ProjectPreferences = projectCtx.getProjectPreferences();

        Cookie.setCookie(Cookie.SEARCH_STRING_MATCH_MODE, settings.stringMatchMode, 365*10);
        Cookie.setCookie(Cookie.SEARCH_USE_URI, settings.useURI+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_USE_LOCAL_NAME, settings.useLocalName+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_USE_NOTES, settings.useNotes+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_CONCEPT_SCHEME_RESTRICTION, settings.restrictActiveScheme+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_EXTEND_ALL_INDIVIDUALS, settings.extendToAllIndividuals+"", 365*10);

        if (projectPreferences.searchSettings.languages != settings.languages) {
            this.prefService.setPUSetting(Properties.pref_search_languages, JSON.stringify(settings.languages), projectCtx.getProject()).subscribe();
        }
        if (projectPreferences.searchSettings.restrictLang != settings.restrictLang) {
            this.prefService.setPUSetting(Properties.pref_search_restrict_lang, settings.restrictLang+"", projectCtx.getProject()).subscribe();
        }
        if (projectPreferences.searchSettings.includeLocales != settings.includeLocales) {
            this.prefService.setPUSetting(Properties.pref_search_include_locales, settings.includeLocales+"", projectCtx.getProject()).subscribe();
        }
        if (projectPreferences.searchSettings.useAutocompletion != settings.useAutocompletion) {
            this.prefService.setPUSetting(Properties.pref_search_use_autocomplete, settings.useAutocompletion+"", projectCtx.getProject()).subscribe();
        }
        projectPreferences.searchSettings = settings;
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