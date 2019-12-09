import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { Language, Languages } from '../models/LanguagesCountries';
import { ExtensionPointID } from '../models/Plugins';
import { ProjectTableColumnStruct } from '../models/Project';
import { ClassIndividualPanelSearchMode, ClassTreeFilter, ClassTreePreference, ConceptTreePreference, ConceptTreeVisualizationMode, LexEntryVisualizationMode, LexicalEntryListPreference, ProjectPreferences, ProjectSettings, Properties, ResourceViewMode, PartitionFilterPreference, SearchMode, SearchSettings, ValueFilterLanguages } from '../models/Properties';
import { ResViewPartition } from '../models/ResourceView';
import { OWL, RDFS } from '../models/Vocabulary';
import { AdministrationServices } from '../services/administrationServices';
import { PreferencesSettingsServices } from '../services/preferencesSettingsServices';
import { Cookie } from '../utils/Cookie';
import { UIUtils } from '../utils/UIUtils';
import { VBEventHandler } from '../utils/VBEventHandler';
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
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
            Properties.pref_class_tree_filter, Properties.pref_class_tree_root,
            Properties.pref_concept_tree_base_broader_prop, Properties.pref_concept_tree_broader_props, Properties.pref_concept_tree_narrower_props,
            Properties.pref_concept_tree_include_subprops, Properties.pref_concept_tree_sync_inverse, Properties.pref_concept_tree_visualization,
            Properties.pref_lex_entry_list_visualization, Properties.pref_lex_entry_list_index_lenght,
            Properties.pref_editing_language, Properties.pref_filter_value_languages,
            Properties.pref_res_view_partition_filter, Properties.pref_graph_view_partition_filter, Properties.pref_hide_literal_graph_nodes
        ];
        
        let options: VBRequestOptions = new VBRequestOptions({ ctxProject: projectCtx.getProject() });
        let getPUSettingsNoPlugin = this.prefService.getPUSettings(properties, null, options).map(
            prefs => {
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

                projectPreferences.showFlags = prefs[Properties.pref_show_flags] == "true"

                let showInstPref: string = prefs[Properties.pref_show_instances_number];
                if (showInstPref != null) {
                    projectPreferences.showInstancesNumber = showInstPref == "true";
                } else { //if not specified, true for RDFS and OWL projects, false otherwise
                    let modelType: string = projectCtx.getProject().getModelType();
                    projectPreferences.showInstancesNumber = modelType == RDFS.uri || modelType == OWL.uri;
                }

                let projectThemeId = prefs[Properties.pref_project_theme];
                projectPreferences.projectThemeId = projectThemeId;
                UIUtils.changeNavbarTheme(projectThemeId);

                //languages 
                projectPreferences.editingLanguage = prefs[Properties.pref_editing_language];

                let filterValueLangPref = prefs[Properties.pref_filter_value_languages];
                if (filterValueLangPref == null) {
                    projectPreferences.filterValueLang = { languages: [], enabled: false }; //default
                } else {
                    projectPreferences.filterValueLang = JSON.parse(filterValueLangPref);
                }

                let rvPartitionFilterPref = prefs[Properties.pref_res_view_partition_filter];
                if (rvPartitionFilterPref != null) {
                    projectPreferences.resViewPartitionFilter = JSON.parse(rvPartitionFilterPref);
                } else { //initialize with empty partition list for each role
                    let resViewPartitionFilter: PartitionFilterPreference = {};
                    for (let role in RDFResourceRolesEnum) { 
                        resViewPartitionFilter[role] = [];
                    }
                    projectPreferences.resViewPartitionFilter = resViewPartitionFilter;
                }

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
                    }
                };
                let classTreeFilterPref: any = JSON.parse(prefs[Properties.pref_class_tree_filter]);
                if (classTreeFilterPref != null) {
                    classTreePreferences.filter = classTreeFilterPref;
                }
                let classTreeRootPref: string = prefs[Properties.pref_class_tree_root];
                if (classTreeRootPref != null) {
                    classTreePreferences.rootClassUri = classTreeRootPref;
                }
                projectPreferences.classTreePreferences = classTreePreferences;


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
                if (conceptTreeVisualizationPref != null && conceptTreeVisualizationPref == ConceptTreeVisualizationMode.searchBased) {
                    conceptTreePreferences.visualization = conceptTreeVisualizationPref;
                }
                conceptTreePreferences.includeSubProps = prefs[Properties.pref_concept_tree_include_subprops] != "false";
                conceptTreePreferences.syncInverse = prefs[Properties.pref_concept_tree_sync_inverse] != "false";

                projectPreferences.conceptTreePreferences = conceptTreePreferences;


                //lexical entry list preferences
                let lexEntryListPreferences: LexicalEntryListPreference = new LexicalEntryListPreference();
                let lexEntryListVisualizationPref: string = prefs[Properties.pref_lex_entry_list_visualization];
                if (lexEntryListVisualizationPref != null && lexEntryListVisualizationPref == LexEntryVisualizationMode.searchBased) {
                    lexEntryListPreferences.visualization = lexEntryListVisualizationPref;
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
            }
        );

        // this is called separately since requires the pluginId parameter
        let getPUSettingsRenderingEngine = this.prefService.getPUSettings([Properties.pref_languages], ExtensionPointID.RENDERING_ENGINE_ID, options).map(
            prefs => {
                projectCtx.getProjectPreferences().projectLanguagesPreference = prefs[Properties.pref_languages].split(",");
            }
        );

        return Observable.forkJoin(getPUSettingsNoPlugin, getPUSettingsRenderingEngine);
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
        this.prefService.setPUSetting(Properties.pref_active_lexicon, lexicon.getURI(), null, new VBRequestOptions({ctxProject: projectCtx.getProject()})).subscribe();
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
        this.prefService.setShowFlags(show).subscribe();
    }

    setShowInstancesNumber(show: boolean) {
        VBContext.getWorkingProjectCtx().getProjectPreferences().showInstancesNumber = show;
        this.prefService.setShowInstancesNumb(show).subscribe();
    }

    setProjectTheme(theme: number) {
        VBContext.getWorkingProjectCtx().getProjectPreferences().projectThemeId = theme;
        UIUtils.changeNavbarTheme(theme);
        this.prefService.setProjectTheme(theme).subscribe();
    }

    setLanguagesPreference(languages: string[]) {
        this.prefService.setLanguages(languages).subscribe();
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

    //concept tree settings
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
    setLexicalEntryListIndexLenght(lenght: number) {
        this.prefService.setPUSetting(Properties.pref_lex_entry_list_index_lenght, lenght+"").subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().lexEntryListPreferences.indexLength = lenght;
    }

    setResourceViewPartitionFilter(pref: PartitionFilterPreference) {
        this.prefService.setPUSetting(Properties.pref_res_view_partition_filter, JSON.stringify(pref)).subscribe();
        VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPartitionFilter = pref;
    }

    //Graph settings
    setGraphViewPartitionFilter(pref: PartitionFilterPreference) {
        this.prefService.setPUSetting(Properties.pref_graph_view_partition_filter, JSON.stringify(pref)).subscribe();
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
        return this.adminService.getProjectUserBinding(projectCtx.getProject().getName(), VBContext.getLoggedUser().getEmail()).map(
            pub => {
                projectCtx.setProjectUserBinding(pub);
            }
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
                        "'languages' property. Please, report this to the system administrator.", "error");
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
        var properties: string[] = [Properties.setting_languages];
        let projectSettings: ProjectSettings = projectCtx.getProjectSettings();
        return this.prefService.getProjectSettings(properties, projectCtx.getProject()).map(
            settings => {
                var langsValue: string = settings[Properties.setting_languages];
                try {
                    projectSettings.projectLanguagesSetting = <Language[]>JSON.parse(langsValue);
                    Languages.sortLanguages(projectSettings.projectLanguagesSetting);
                } catch (err) {
                    this.basicModals.alert("Error", "Project setting initialization has encountered a problem during parsing " +
                        "languages settings. Default languages will be set for this project.", "error");
                    projectSettings.projectLanguagesSetting = [
                        { name: "German" , tag: "de" }, { name: "English" , tag: "en" }, { name: "Spanish" , tag: "es" },
                        { name: "French" , tag: "fr" }, { name: "Italian" , tag: "it" }
                    ];
                }
            }
        );
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

    /**
     * Sets the preference to show the deprecated resources in the trees/lists
     * @param showDeprecated 
     */
    setShowDeprecated(showDeprecated: boolean) {
        Cookie.setCookie(Cookie.SHOW_DEPRECATED, showDeprecated + "", 365*10);
    }
    /**
     * Gets the preference to show the deprecated resources in the trees/lists
     */
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
        let clsIndPanelSearchModeCookie: string = Cookie.getCookie(Cookie.SEARCH_CLS_IND_PANEL);
        if (clsIndPanelSearchModeCookie != null) {
            preferences.searchSettings.classIndividualSearchMode = <ClassIndividualPanelSearchMode>clsIndPanelSearchModeCookie;
        }
    }

    setSearchSettings(projectCtx: ProjectContext, settings: SearchSettings) {
        let projectPreferences: ProjectPreferences = projectCtx.getProjectPreferences();

        Cookie.setCookie(Cookie.SEARCH_STRING_MATCH_MODE, settings.stringMatchMode, 365*10);
        Cookie.setCookie(Cookie.SEARCH_USE_URI, settings.useURI+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_USE_LOCAL_NAME, settings.useLocalName+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_USE_NOTES, settings.useNotes+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_CONCEPT_SCHEME_RESTRICTION, settings.restrictActiveScheme+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_CLS_IND_PANEL, settings.classIndividualSearchMode, 365*10);

        let options: VBRequestOptions = new VBRequestOptions({ ctxProject: projectCtx.getProject() });

        if (projectPreferences.searchSettings.languages != settings.languages) {
            this.prefService.setPUSetting(Properties.pref_search_languages, JSON.stringify(settings.languages), null, options).subscribe();
        }
        if (projectPreferences.searchSettings.restrictLang != settings.restrictLang) {
            this.prefService.setPUSetting(Properties.pref_search_restrict_lang, settings.restrictLang+"", null, options).subscribe();
        }
        if (projectPreferences.searchSettings.includeLocales != settings.includeLocales) {
            this.prefService.setPUSetting(Properties.pref_search_include_locales, settings.includeLocales+"", null, options).subscribe();
        }
        if (projectPreferences.searchSettings.useAutocompletion != settings.useAutocompletion) {
            this.prefService.setPUSetting(Properties.pref_search_use_autocomplete, settings.useAutocompletion+"", null, options).subscribe();
        }
        projectPreferences.searchSettings = settings;
        this.eventHandler.searchPrefsUpdatedEvent.emit(projectCtx.getProject());
    }

    
    getDefaultProjectTableColumns(): ProjectTableColumnStruct[] {
        return [
            { name: "Accessed", show: true, mandatory: true }, { name: "Open/Close", show: true, mandatory: true },
            { name: "Project Name", show: true, mandatory: true }, { name: "Model", show: true },
            { name: "Lexicalization Model", show: true }, { name: "History", show: true },
            { name: "Validation", show: true }, { name: "Repository Location", show: true }
        ];
    };
    getCustomProjectTableColumns(): ProjectTableColumnStruct[] {
        let defaultColumns: ProjectTableColumnStruct[] = this.getDefaultProjectTableColumns();
        var value = Cookie.getCookie(Cookie.PROJECT_TABLE_ORDER);
        if (value == null) {
            return defaultColumns;
        } else {
            let customColumns: ProjectTableColumnStruct[] = JSON.parse(value);
            /**
             * check if there is some default columns not stored in cookie (add it eventually)
             * and if there is some columns stored in the cookie not foreseen in the default columns structure
             * (feasible scenarios if, in the client, the project table structure is changed by adding/removing some columns,
             * so the column struct stored in the cookie is not in sync with the default one)
             */
            defaultColumns.forEach((col: ProjectTableColumnStruct) => {
                let columnFound: boolean = false;
                for (var i = 0; i < customColumns.length; i++) {
                    if (col.name == customColumns[i].name) {
                        columnFound = true;
                        break;
                    }
                }
                if (!columnFound) {
                    customColumns.push(col); //add the default column to the customized structure
                }
            });

            customColumns.forEach((col: ProjectTableColumnStruct) => {
                let columnFound: boolean = false;
                for (var i = 0; i < defaultColumns.length; i++) {
                    if (col.name == defaultColumns[i].name) {
                        columnFound = true;
                        break;
                    }
                }
                if (!columnFound) {
                    customColumns.splice(customColumns.indexOf(col), 1); //remove the column from the customized structure
                }
            });

            return customColumns;
        }
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