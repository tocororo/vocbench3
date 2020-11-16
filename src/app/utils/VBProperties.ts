import { Injectable } from '@angular/core';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { Language, Languages } from '../models/LanguagesCountries';
import { ExtensionPointID } from '../models/Plugins';
import { ClassTreeFilter, ClassTreePreference, ConceptTreePreference, ConceptTreeVisualizationMode, InstanceListPreference, InstanceListVisualizationMode, LexEntryVisualizationMode, LexicalEntryListPreference, MultischemeMode, NotificationStatus, PartitionFilterPreference, PrefLabelClashMode, ProjectPreferences, ProjectSettings, Properties, ResourceViewMode, ResourceViewPreference, ResourceViewType, SearchMode, SearchSettings, ValueFilterLanguages } from '../models/Properties';
import { ResViewPartition } from '../models/ResourceView';
import { OWL, RDFS } from '../models/Vocabulary';
import { AdministrationServices } from '../services/administrationServices';
import { PreferencesSettingsServices } from '../services/preferencesSettingsServices';
import { Cookie } from '../utils/Cookie';
import { VBEventHandler } from '../utils/VBEventHandler';
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
import { ModalType } from '../widget/modal/Modals';
import { VBRequestOptions } from './HttpManager';
import { ProjectContext, VBContext } from './VBContext';

@Injectable()
export class VBProperties {

    private eventSubscriptions: Subscription[] = [];

    constructor(private prefService: PreferencesSettingsServices, private adminService: AdministrationServices,
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
        var properties: string[] = [
            Properties.pref_active_schemes, Properties.pref_active_lexicon, Properties.pref_show_flags,
            Properties.pref_show_instances_number, Properties.pref_project_theme,
            Properties.pref_search_languages, Properties.pref_search_restrict_lang, 
            Properties.pref_search_include_locales, Properties.pref_search_use_autocomplete, 
            Properties.pref_class_tree_filter, Properties.pref_class_tree_root, Properties.pref_instance_list_visualization,
            Properties.pref_concept_tree_base_broader_prop, Properties.pref_concept_tree_broader_props, Properties.pref_concept_tree_narrower_props,
            Properties.pref_concept_tree_include_subprops, Properties.pref_concept_tree_sync_inverse, Properties.pref_concept_tree_visualization,
            Properties.pref_concept_tree_multischeme_mode, Properties.pref_concept_tree_safe_to_go_limit,
            Properties.pref_lex_entry_list_visualization, Properties.pref_lex_entry_list_index_lenght, Properties.pref_lex_entry_list_safe_to_go_limit,
            Properties.pref_editing_language, Properties.pref_filter_value_languages,
            Properties.pref_res_view_partition_filter, Properties.pref_res_view_default_concept_type,
            Properties.pref_graph_view_partition_filter, Properties.pref_hide_literal_graph_nodes,
            Properties.pref_notifications_status
        ];
        
        let getPUSettingsNoPlugin = this.prefService.getPUSettings(properties, projectCtx.getProject()).pipe(
            map(prefs => {
                let projectPreferences: ProjectPreferences = projectCtx.getProjectPreferences();

                let activeSchemes: ARTURIResource[] = [];
                let activeSchemesPref: string = prefs[Properties.pref_active_schemes];
                if (activeSchemesPref != null) {
                    let skSplitted: string[] = activeSchemesPref.split(",");
                    for (var i = 0; i < skSplitted.length; i++) {
                        activeSchemes.push(new ARTURIResource(skSplitted[i], null, RDFResourceRolesEnum.conceptScheme));
                    }
                }
                projectPreferences.activeSchemes = activeSchemes;

                let activeLexicon: ARTURIResource;
                let activeLexiconPref: string = prefs[Properties.pref_active_lexicon];
                if (activeLexiconPref != null) {
                    activeLexicon = new ARTURIResource(activeLexiconPref, null, RDFResourceRolesEnum.limeLexicon);
                }
                projectPreferences.activeLexicon = activeLexicon;

                projectPreferences.showFlags = prefs[Properties.pref_show_flags] == "true";

                let projectThemeId = prefs[Properties.pref_project_theme];
                projectPreferences.projectThemeId = projectThemeId;
                this.eventHandler.themeChangedEvent.emit(projectPreferences.projectThemeId);

                //languages 
                projectPreferences.editingLanguage = prefs[Properties.pref_editing_language];

                let filterValueLangPref = prefs[Properties.pref_filter_value_languages];
                if (filterValueLangPref == null) {
                    projectPreferences.filterValueLang = { languages: [], enabled: false }; //default
                } else {
                    projectPreferences.filterValueLang = JSON.parse(filterValueLangPref);
                }

                //resource view preferences
                let resViewPreferences: ResourceViewPreference = new ResourceViewPreference();
                let resViewConceptTypePref = prefs[Properties.pref_res_view_default_concept_type];
                if (resViewConceptTypePref in ResourceViewType) {
                    resViewPreferences.defaultConceptType = resViewConceptTypePref;
                }

                let resViewPartitionFilter: PartitionFilterPreference = {};
                let rvPartitionFilterPref = prefs[Properties.pref_res_view_partition_filter];
                if (rvPartitionFilterPref != null) {
                    resViewPartitionFilter = JSON.parse(rvPartitionFilterPref);
                }
                resViewPreferences.resViewPartitionFilter = resViewPartitionFilter;

                projectPreferences.resViewPreferences = resViewPreferences;

                this.initResourceViewPreferenceCookie(projectPreferences); //fill the preferences also with those stored as cookie

                //graph preferences
                let graphPartitionFilterPref = prefs[Properties.pref_graph_view_partition_filter];
                if (graphPartitionFilterPref != null) {
                    projectPreferences.graphViewPartitionFilter = JSON.parse(graphPartitionFilterPref);
                } else { //initialize with the only lexicalization partition for each role
                    let graphPartitionFilterPref: PartitionFilterPreference = {};
                    for (let role in RDFResourceRolesEnum) { 
                        graphPartitionFilterPref[role] = [ResViewPartition.lexicalizations];
                    }
                    projectPreferences.graphViewPartitionFilter = graphPartitionFilterPref;
                }

                projectPreferences.hideLiteralGraphNodes = prefs[Properties.pref_hide_literal_graph_nodes] != "false";


                //cls tree preferences
                let classTreePreferences: ClassTreePreference = { 
                    rootClassUri: (projectCtx.getProject().getModelType() == RDFS.uri) ? RDFS.resource.getURI() : OWL.thing.getURI(),
                    filter: {
                        enabled: true,
                        map: {}
                    },
                    showInstancesNumber: false
                };
                //- subclass filter
                let classTreeFilterPref: any = JSON.parse(prefs[Properties.pref_class_tree_filter]); 
                if (classTreeFilterPref != null) {
                    classTreePreferences.filter = classTreeFilterPref;
                }
                //- tree root
                let classTreeRootPref: string = prefs[Properties.pref_class_tree_root]; 
                if (classTreeRootPref != null) {
                    classTreePreferences.rootClassUri = classTreeRootPref;
                }
                projectPreferences.classTreePreferences = classTreePreferences;
                //- show Instances number
                let showInstPref: string = prefs[Properties.pref_show_instances_number];
                if (showInstPref != null) {
                    classTreePreferences.showInstancesNumber = showInstPref == "true";
                } else { //if not specified, true for RDFS and OWL projects, false otherwise
                    let modelType: string = projectCtx.getProject().getModelType();
                    classTreePreferences.showInstancesNumber = modelType == RDFS.uri || modelType == OWL.uri;
                }

                //instance list preferences
                let instanceListPreferences: InstanceListPreference = new InstanceListPreference();
                let instanceListVisualizationPref: string = prefs[Properties.pref_instance_list_visualization];
                if (instanceListVisualizationPref == InstanceListVisualizationMode.searchBased) {
                    instanceListPreferences.visualization = instanceListVisualizationPref;
                }
                projectPreferences.instanceListPreferences = instanceListPreferences;

                //concept tree preferences
                let conceptTreePreferences: ConceptTreePreference = new ConceptTreePreference();
                let conceptTreeBaseBroaderPropPref: string = prefs[Properties.pref_concept_tree_base_broader_prop];
                if (conceptTreeBaseBroaderPropPref != null) {
                    conceptTreePreferences.baseBroaderUri = conceptTreeBaseBroaderPropPref;
                }
                let conceptTreeBroaderPropsPref: string = prefs[Properties.pref_concept_tree_broader_props];
                if (conceptTreeBroaderPropsPref != null) {
                    conceptTreePreferences.broaderProps = conceptTreeBroaderPropsPref.split(",");
                }
                let conceptTreeNarrowerPropsPref: string = prefs[Properties.pref_concept_tree_narrower_props];
                if (conceptTreeNarrowerPropsPref != null) {
                    conceptTreePreferences.narrowerProps = conceptTreeNarrowerPropsPref.split(",");
                }
                let conceptTreeVisualizationPref: string = prefs[Properties.pref_concept_tree_visualization];
                if (conceptTreeVisualizationPref == ConceptTreeVisualizationMode.searchBased) {
                    conceptTreePreferences.visualization = conceptTreeVisualizationPref;
                }
                let conceptTreeMultischemeModePref: string = prefs[Properties.pref_concept_tree_multischeme_mode];
                if (conceptTreeMultischemeModePref != null && conceptTreeMultischemeModePref == MultischemeMode.and) {
                    conceptTreePreferences.multischemeMode = conceptTreeMultischemeModePref;
                }
                let conceptTreeSafeToGoLimitPref: string = prefs[Properties.pref_concept_tree_safe_to_go_limit];
                if (conceptTreeSafeToGoLimitPref != null) {
                    conceptTreePreferences.safeToGoLimit = parseInt(conceptTreeSafeToGoLimitPref);
                }

                conceptTreePreferences.includeSubProps = prefs[Properties.pref_concept_tree_include_subprops] != "false";
                conceptTreePreferences.syncInverse = prefs[Properties.pref_concept_tree_sync_inverse] != "false";

                projectPreferences.conceptTreePreferences = conceptTreePreferences;


                //lexical entry list preferences
                let lexEntryListPreferences: LexicalEntryListPreference = new LexicalEntryListPreference();
                let lexEntryListVisualizationPref: string = prefs[Properties.pref_lex_entry_list_visualization];
                if (lexEntryListVisualizationPref == LexEntryVisualizationMode.searchBased) {
                    lexEntryListPreferences.visualization = lexEntryListVisualizationPref;
                }
                let lexEntryListSafeToGoLimitPref: string = prefs[Properties.pref_lex_entry_list_safe_to_go_limit];
                if (lexEntryListSafeToGoLimitPref != null) {
                    lexEntryListPreferences.safeToGoLimit = parseInt(lexEntryListSafeToGoLimitPref);
                }
                let lexEntryListIndexLenghtPref: string = prefs[Properties.pref_lex_entry_list_index_lenght];
                if (lexEntryListIndexLenghtPref == "2") {
                    lexEntryListPreferences.indexLength = 2;
                }
                projectPreferences.lexEntryListPreferences = lexEntryListPreferences;

                //search settings
                let searchSettings: SearchSettings = new SearchSettings();
                let searchLangsPref = prefs[Properties.pref_search_languages];
                if (searchLangsPref == null) {
                    searchSettings.languages = [];
                } else {
                    searchSettings.languages = JSON.parse(searchLangsPref);
                }
                searchSettings.restrictLang = prefs[Properties.pref_search_restrict_lang] == "true";
                searchSettings.includeLocales = prefs[Properties.pref_search_include_locales] == "true";
                searchSettings.useAutocompletion = prefs[Properties.pref_search_use_autocomplete] == "true";

                projectPreferences.searchSettings = searchSettings;

                this.initSearchSettingsCookie(projectPreferences); //other settings stored in cookies

                //notifications
                let notificationStatusPref = prefs[Properties.pref_notifications_status];
                if (notificationStatusPref != null && (notificationStatusPref in NotificationStatus)) { //if a valid value
                    projectPreferences.notificationStatus = notificationStatusPref;
                }
            })
        );

        // this is called separately since requires the pluginId parameter
        let getPUSettingsRenderingEngine = this.prefService.getPUSettings([Properties.pref_languages], projectCtx.getProject(), ExtensionPointID.RENDERING_ENGINE_ID).pipe(
            map(prefs => {
                projectCtx.getProjectPreferences().projectLanguagesPreference = prefs[Properties.pref_languages].split(",");
            })
        );
        return forkJoin([getPUSettingsNoPlugin, getPUSettingsRenderingEngine]);
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
        this.prefService.setPUSetting(Properties.pref_concept_tree_safe_to_go_limit, limit+"").subscribe();
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

    setResourceViewPartitionFilter(pref: PartitionFilterPreference) {
        let value = (pref != null) ? JSON.stringify(pref) : null;
        this.prefService.setPUSetting(Properties.pref_res_view_partition_filter, value).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.resViewPartitionFilter = pref;
    }
    refreshResourceViewPartitionFilter(): Observable<void> { //refreshed the cached rv partition filter
        return this.prefService.getPUSettings([Properties.pref_res_view_partition_filter]).pipe(
            map(prefs => {
                let value = prefs[Properties.pref_res_view_partition_filter];
                let filter: PartitionFilterPreference;
                if (value != null) {
                    filter = JSON.parse(value);
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
                    var systemLanguages = <Language[]>JSON.parse(stResp[Properties.setting_languages]);
                    Languages.sortLanguages(systemLanguages);
                    Languages.setSystemLanguages(systemLanguages);
                } catch (err) {
                    this.basicModals.alert("Error", "Initialization of system languages has encountered a problem during parsing the " +
                        "'languages' property. Please, report this to the system administrator.", ModalType.error);
                }
                //home content
                VBContext.getSystemSettings().homeContent = stResp[Properties.setting_home_content];
            }
        )
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
        let properties: string[] = [Properties.setting_languages, Properties.label_clash_mode];
        let projectSettings: ProjectSettings = projectCtx.getProjectSettings();
        return this.prefService.getProjectSettings(properties, projectCtx.getProject()).pipe(
            map(settings => {
                let langsValue: string = settings[Properties.setting_languages];
                try {
                    projectSettings.projectLanguagesSetting = <Language[]>JSON.parse(langsValue);
                    Languages.sortLanguages(projectSettings.projectLanguagesSetting);
                } catch (err) {
                    this.basicModals.alert("Error", "Project setting initialization has encountered a problem during parsing " +
                        "languages settings. Default languages will be set for this project.", ModalType.error);
                    projectSettings.projectLanguagesSetting = [
                        { name: "German" , tag: "de" }, { name: "English" , tag: "en" }, { name: "Spanish" , tag: "es" },
                        { name: "French" , tag: "fr" }, { name: "Italian" , tag: "it" }
                    ];
                }

                let labelClashModeValue = settings[Properties.label_clash_mode];
                if (labelClashModeValue != null && labelClashModeValue in PrefLabelClashMode) { //if not null and valid enum
                    projectSettings.prefLabelClashMode = labelClashModeValue;
                }
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
        for (var i = 0; i < activeSchemes.length; i++) {
            if (activeSchemes[i].getNominalValue() == oldResource.getNominalValue()) {
                activeSchemes[i].setURI(newResource.getNominalValue());
                this.setActiveSchemes(VBContext.getWorkingProjectCtx(), activeSchemes);
                break;
            }
        }
    }

}