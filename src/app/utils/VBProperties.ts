import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { Language, Languages } from '../models/LanguagesCountries';
import { ExtensionPointID } from '../models/Plugins';
import { ProjectTableColumnStruct } from '../models/Project';
import { ClassIndividualPanelSearchMode, ClassTreePreference, ConceptTreePreference, ConceptTreeVisualizationMode, LexEntryVisualizationMode, LexicalEntryListPreference, Properties, ResourceViewMode, ResViewPartitionFilterPreference, SearchMode, SearchSettings, ValueFilterLanguages } from '../models/Properties';
import { OWL, RDFS, SKOS } from '../models/Vocabulary';
import { PreferencesSettingsServices } from '../services/preferencesSettingsServices';
import { Cookie } from '../utils/Cookie';
import { UIUtils } from '../utils/UIUtils';
import { VBEventHandler } from '../utils/VBEventHandler';
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
import { ResourceUtils } from './ResourceUtils';
import { VBContext } from './VBContext';

@Injectable()
export class VBProperties {

    private projectLanguagesSetting: Language[] = []; //all available languages in a project (settings)
    private projectLanguagesPreference: string[] = []; //languages that user has assigned for project (and ordered according his preferences)

    private editingLanguage: string; //default editing language
    private filterValueLang: ValueFilterLanguages; //languages visible in resource description (e.g. in ResourceView, Graph,...)

    private activeSchemes: ARTURIResource[] = [];
    private activeLexicon: ARTURIResource;
    private showFlags: boolean = true;
    private showInstancesNumber: boolean = true;
    private projectThemeId: number = null;

    private classTreePreferences: ClassTreePreference;
    private conceptTreePreferences: ConceptTreePreference;
    private lexEntryListPreferences: LexicalEntryListPreference;

    //graph preferences
    private resViewPartitionFilter: ResViewPartitionFilterPreference;
    private hideLiteralGraphNodes: boolean = false;

    private searchSettings: SearchSettings = {
        stringMatchMode: SearchMode.contains,
        useLocalName: true,
        useURI: false,
        useNotes: false,
        restrictLang: false,
        includeLocales: false,
        languages: [],
        useAutocompletion: false,
        restrictActiveScheme: true,
        classIndividualSearchMode: ClassIndividualPanelSearchMode.all
    };

    private experimentalFeaturesEnabled: boolean = false;

    private eventSubscriptions: Subscription[] = [];

    constructor(private prefService: PreferencesSettingsServices, private basicModals: BasicModalServices, private eventHandler: VBEventHandler) {
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
    initUserProjectPreferences() {
        var properties: string[] = [
            Properties.pref_active_schemes, Properties.pref_active_lexicon, Properties.pref_show_flags,
            Properties.pref_show_instances_number, Properties.pref_project_theme,
            Properties.pref_search_languages, Properties.pref_search_restrict_lang, 
            Properties.pref_search_include_locales, Properties.pref_search_use_autocomplete, 
            Properties.pref_class_tree_filter_enabled, Properties.pref_class_tree_filter_map, Properties.pref_class_tree_root,
            Properties.pref_concept_tree_base_broader_prop, Properties.pref_concept_tree_broader_props, Properties.pref_concept_tree_narrower_props,
            Properties.pref_concept_tree_include_subprops, Properties.pref_concept_tree_sync_inverse, Properties.pref_concept_tree_visualization,
            Properties.pref_lex_entry_list_visualization, Properties.pref_lex_entry_list_index_lenght,
            Properties.pref_editing_language, Properties.pref_filter_value_languages,
            Properties.pref_res_view_partition_filter, Properties.pref_hide_literal_graph_nodes
        ];
        this.prefService.getPUSettings(properties).subscribe(
            prefs => {
                this.activeSchemes = [];
                let activeSchemesPref: string = prefs[Properties.pref_active_schemes];
                if (activeSchemesPref != null) {
                    let skSplitted: string[] = activeSchemesPref.split(",");
                    for (var i = 0; i < skSplitted.length; i++) {
                        this.activeSchemes.push(new ARTURIResource(skSplitted[i], null, RDFResourceRolesEnum.conceptScheme));
                    }
                }

                this.activeLexicon = null;
                let activeLexiconPref: string = prefs[Properties.pref_active_lexicon];
                if (activeLexiconPref != null) {
                    this.activeLexicon = new ARTURIResource(activeLexiconPref, null, RDFResourceRolesEnum.limeLexicon);
                }

                this.showFlags = prefs[Properties.pref_show_flags] == "true";

                let showInstPref: string = prefs[Properties.pref_show_instances_number];
                if (showInstPref != null) {
                    this.showInstancesNumber = showInstPref == "true";
                } else { //if not specified, true for RDFS and OWL projects, false otherwise
                    let modelType: string = VBContext.getWorkingProject().getModelType();
                    this.showInstancesNumber = modelType == RDFS.uri || modelType == OWL.uri;
                }

                this.projectThemeId = prefs[Properties.pref_project_theme];
                UIUtils.changeNavbarTheme(this.projectThemeId);

                //languages 
                this.editingLanguage = prefs[Properties.pref_editing_language];

                let filterValueLangPref = prefs[Properties.pref_filter_value_languages];
                if (filterValueLangPref == null) {
                    this.filterValueLang = { languages: ["*"], enabled: false }; //default
                } else {
                    this.filterValueLang = JSON.parse(filterValueLangPref);
                }

                //graph preferences
                let rvPartitionFilterPref = prefs[Properties.pref_res_view_partition_filter];
                if (rvPartitionFilterPref != null) {
                    this.resViewPartitionFilter = JSON.parse(rvPartitionFilterPref);
                } else {
                    this.resViewPartitionFilter = {};
                }

                this.hideLiteralGraphNodes = prefs[Properties.pref_hide_literal_graph_nodes] == "true";

                //cls tree preferences
                this.classTreePreferences = { 
                    rootClassUri: (VBContext.getWorkingProject().getModelType() == RDFS.uri) ? RDFS.resource.getURI() : OWL.thing.getURI(),
                    filterMap: {}, 
                    filterEnabled: true 
                };
                let classTreeFilterMapPref: any = JSON.parse(prefs[Properties.pref_class_tree_filter_map]);
                if (classTreeFilterMapPref != null) {
                    this.classTreePreferences.filterMap = classTreeFilterMapPref;
                }
                this.classTreePreferences.filterEnabled = prefs[Properties.pref_class_tree_filter_enabled] != "false";
                let classTreeRootPref: string = prefs[Properties.pref_class_tree_root];
                if (classTreeRootPref != null) {
                    this.classTreePreferences.rootClassUri = classTreeRootPref;
                }

                //concept tree preferences
                this.conceptTreePreferences = {
                    baseBroaderUri: SKOS.broader.getURI(),
                    broaderProps: [],
                    narrowerProps: [],
                    includeSubProps: true,
                    syncInverse: true,
                    visualization: ConceptTreeVisualizationMode.hierarchyBased
                }
                let conceptTreeBaseBroaderPropPref: string = prefs[Properties.pref_concept_tree_base_broader_prop];
                if (conceptTreeBaseBroaderPropPref != null) {
                    this.conceptTreePreferences.baseBroaderUri = conceptTreeBaseBroaderPropPref;
                }
                let conceptTreeBroaderPropsPref: string = prefs[Properties.pref_concept_tree_broader_props];
                if (conceptTreeBroaderPropsPref != null) {
                    this.conceptTreePreferences.broaderProps = conceptTreeBroaderPropsPref.split(",");
                }
                let conceptTreeNarrowerPropsPref: string = prefs[Properties.pref_concept_tree_narrower_props];
                if (conceptTreeNarrowerPropsPref != null) {
                    this.conceptTreePreferences.narrowerProps = conceptTreeNarrowerPropsPref.split(",");
                }
                let conceptTreeVisualizationPref: string = prefs[Properties.pref_concept_tree_visualization];
                if (conceptTreeVisualizationPref != null && conceptTreeVisualizationPref == ConceptTreeVisualizationMode.searchBased) {
                    this.conceptTreePreferences.visualization = conceptTreeVisualizationPref;
                }
                this.conceptTreePreferences.includeSubProps = prefs[Properties.pref_concept_tree_include_subprops] != "false";
                this.conceptTreePreferences.syncInverse = prefs[Properties.pref_concept_tree_sync_inverse] != "false";

                //lexical entry list preferences
                this.lexEntryListPreferences = {
                    visualization: LexEntryVisualizationMode.indexBased,
                    indexLength: 1
                }
                let lexEntryListVisualizationPref: string = prefs[Properties.pref_lex_entry_list_visualization];
                if (lexEntryListVisualizationPref != null && lexEntryListVisualizationPref == LexEntryVisualizationMode.searchBased) {
                    this.lexEntryListPreferences.visualization = lexEntryListVisualizationPref;
                }
                let lexEntryListIndexLenghtPref: string = prefs[Properties.pref_lex_entry_list_index_lenght];
                if (lexEntryListIndexLenghtPref == "2") {
                    this.lexEntryListPreferences.indexLength = 2;
                }

                //search settings
                let searchLangsPref = prefs[Properties.pref_search_languages];
                if (searchLangsPref == null) {
                    this.searchSettings.languages = [];
                } else {
                    this.searchSettings.languages = JSON.parse(searchLangsPref);
                }
                this.searchSettings.restrictLang = prefs[Properties.pref_search_restrict_lang] == "true";
                this.searchSettings.includeLocales = prefs[Properties.pref_search_include_locales] == "true";
                this.searchSettings.useAutocompletion = prefs[Properties.pref_search_use_autocomplete] == "true";

                this.initSearchSettingsCookie(); //other settings stored in cookies
            }
        );

        // this is called separately since requires the pluginId parameter
        this.prefService.getPUSettings([Properties.pref_languages], ExtensionPointID.RENDERING_ENGINE_ID).subscribe(
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
        this.prefService.setActiveSchemes(this.activeSchemes).subscribe(
            stResp => {
                this.eventHandler.schemeChangedEvent.emit(this.activeSchemes);
            }
        );
    }
    isActiveScheme(scheme: ARTURIResource): boolean {
        return ResourceUtils.containsNode(this.activeSchemes, scheme);
    }

    getActiveLexicon(): ARTURIResource {
        return this.activeLexicon;
    }
    setActiveLexicon(lexicon: ARTURIResource) {
        this.activeLexicon = lexicon;
        this.prefService.setPUSetting(Properties.pref_active_lexicon, this.activeLexicon.getURI()).subscribe(
            stResp => {
                this.eventHandler.lexiconChangedEvent.emit(this.activeLexicon);
            }
        );
    }
    isActiveLexicon(lexicon: ARTURIResource): boolean {
        return this.activeLexicon != null && this.activeLexicon.getURI() == lexicon.getURI();
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
        this.prefService.setLanguages(languages).subscribe();
        this.projectLanguagesPreference = languages;
    }

    getEditingLanguage(): string {
        return this.editingLanguage;
    }
    setEditingLanguage(lang: string) {
        this.prefService.setPUSetting(Properties.pref_editing_language, lang).subscribe();
        this.editingLanguage = lang;
    }

    getValueFilterLanguages(): ValueFilterLanguages {
        return this.filterValueLang;
    }
    setValueFilterLanguages(filter: ValueFilterLanguages) {
        this.prefService.setPUSetting(Properties.pref_filter_value_languages, JSON.stringify(filter)).subscribe();
        this.filterValueLang = filter;
    }

    //class tree settings
    getClassTreePreferences(): ClassTreePreference {
        return this.classTreePreferences;
    }
    setClassTreeFilterMap(filterMap: { [key: string]: string[] }) {
        this.prefService.setPUSetting(Properties.pref_class_tree_filter_map, JSON.stringify(filterMap)).subscribe();
        this.classTreePreferences.filterMap = filterMap;
    }
    setClassTreeFilterEnabled(enabled: boolean) {
        this.prefService.setPUSetting(Properties.pref_class_tree_filter_enabled, enabled+"").subscribe();
        this.classTreePreferences.filterEnabled = enabled;
    }
    setClassTreeRoot(rootUri: string) {
        this.prefService.setPUSetting(Properties.pref_class_tree_root, rootUri).subscribe();
        this.classTreePreferences.rootClassUri = rootUri;
    }

    //concept tree settings
    getConceptTreePreferences(): ConceptTreePreference {
        return this.conceptTreePreferences;
    }
    setConceptTreeBaseBroaderProp(propUri: string) {
        this.prefService.setPUSetting(Properties.pref_concept_tree_base_broader_prop, propUri).subscribe();
        this.conceptTreePreferences.baseBroaderUri = propUri;
    }
    setConceptTreeBroaderProps(props: string[]) {
        let prefValue: string;
        if (props.length > 0) {
            prefValue = props.join(",")
        }
        this.prefService.setPUSetting(Properties.pref_concept_tree_broader_props, prefValue).subscribe();
        this.conceptTreePreferences.broaderProps = props;
    }
    setConceptTreeNarrowerProps(props: string[]) {
        let prefValue: string;
        if (props.length > 0) {
            prefValue = props.join(",")
        }
        this.prefService.setPUSetting(Properties.pref_concept_tree_narrower_props, prefValue).subscribe();
        this.conceptTreePreferences.narrowerProps = props;
    }
    setConceptTreeIncludeSubProps(include: boolean) {
        this.prefService.setPUSetting(Properties.pref_concept_tree_include_subprops, include+"").subscribe();
        this.conceptTreePreferences.includeSubProps = include;
    }
    setConceptTreeSyncInverse(sync: boolean) {
        this.prefService.setPUSetting(Properties.pref_concept_tree_sync_inverse, sync+"").subscribe();
        this.conceptTreePreferences.syncInverse = sync;
    }
    setConceptTreeVisualization(mode: ConceptTreeVisualizationMode) {
        this.prefService.setPUSetting(Properties.pref_concept_tree_visualization, mode).subscribe();
        this.conceptTreePreferences.visualization = mode;
    }

    //lex entry list settings
    getLexicalEntryListPreferences(): LexicalEntryListPreference {
        return this.lexEntryListPreferences;
    }
    setLexicalEntryListVisualization(mode: LexEntryVisualizationMode) {
        this.prefService.setPUSetting(Properties.pref_lex_entry_list_visualization, mode).subscribe();
        this.lexEntryListPreferences.visualization = mode;
    }
    setLexicalEntryListIndexLenght(lenght: number) {
        this.prefService.setPUSetting(Properties.pref_lex_entry_list_index_lenght, lenght+"").subscribe();
        this.lexEntryListPreferences.indexLength = lenght;
    }

    //Graph settings
    getResourceViewPartitionsFilter(): ResViewPartitionFilterPreference {
        return this.resViewPartitionFilter;
    }
    setResourceViewPartitionFilter(pref: ResViewPartitionFilterPreference) {
        this.prefService.setPUSetting(Properties.pref_res_view_partition_filter, JSON.stringify(pref)).subscribe();
        this.resViewPartitionFilter = pref;
    }

    getHideLiteralGraphNodes(): boolean {
        return this.hideLiteralGraphNodes;
    }
    setHideLiteralGraphNodes(show: boolean) {
        this.hideLiteralGraphNodes = show;
        this.prefService.setPUSetting(Properties.pref_hide_literal_graph_nodes, show+"").subscribe();
    }


    /* =============================
    =========== SETTINGS ===========
    ============================= */

    initStartupSystemSettings() {
        this.prefService.getStartupSystemSettings().subscribe(
            stResp => {
                //experimental_features_enabled
                this.experimentalFeaturesEnabled = stResp[Properties.setting_experimental_features_enabled];
                //show_flags
                this.showFlags = stResp[Properties.pref_show_flags];
                //languages
                try {
                    var systemLanguages = <Language[]>JSON.parse(stResp[Properties.setting_languages]);
                    Languages.sortLanguages(systemLanguages);
                    Languages.setSystemLanguages(systemLanguages);
                } catch (err) {
                    this.basicModals.alert("Error", "Initialization of system languages has encountered a problem during parsing the " +
                        "'languages' property. Please, report this to the system administrator.", "error");
                }
            }
        )
    }

    setExperimentalFeaturesEnabled(enabled: boolean) {
        this.prefService.setSystemSetting(Properties.setting_experimental_features_enabled, enabled+"").subscribe();
        this.experimentalFeaturesEnabled = enabled;
    }

    getExperimentalFeaturesEnabled(): boolean {
        return this.experimentalFeaturesEnabled;
    }

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

    initSearchSettingsCookie() {
        let searchModeCookie: string = Cookie.getCookie(Cookie.SEARCH_STRING_MATCH_MODE);
        if (searchModeCookie != null) {
            this.searchSettings.stringMatchMode = <SearchMode>searchModeCookie;
        }
        let useUriCookie: string = Cookie.getCookie(Cookie.SEARCH_USE_URI);
        if (useUriCookie != null) {
            this.searchSettings.useURI = useUriCookie == "true";
        }
        let useLocalNameCookie: string = Cookie.getCookie(Cookie.SEARCH_USE_LOCAL_NAME);
        if (useLocalNameCookie != null) {
            this.searchSettings.useLocalName = useLocalNameCookie == "true";
        }
        let useNotesCookie: string = Cookie.getCookie(Cookie.SEARCH_USE_NOTES);
        if (useNotesCookie != null) {
            this.searchSettings.useNotes = useNotesCookie == "true";
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
        Cookie.setCookie(Cookie.SEARCH_STRING_MATCH_MODE, settings.stringMatchMode, 365*10);
        Cookie.setCookie(Cookie.SEARCH_USE_URI, settings.useURI+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_USE_LOCAL_NAME, settings.useLocalName+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_USE_NOTES, settings.useNotes+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_CONCEPT_SCHEME_RESTRICTION, settings.restrictActiveScheme+"", 365*10);
        Cookie.setCookie(Cookie.SEARCH_CLS_IND_PANEL, settings.classIndividualSearchMode, 365*10);
        if (this.searchSettings.languages != settings.languages) {
            this.prefService.setPUSetting(Properties.pref_search_languages, JSON.stringify(settings.languages)).subscribe();
        }
        if (this.searchSettings.restrictLang != settings.restrictLang) {
            this.prefService.setPUSetting(Properties.pref_search_restrict_lang, settings.restrictLang+"").subscribe();
        }
        if (this.searchSettings.includeLocales != settings.includeLocales) {
            this.prefService.setPUSetting(Properties.pref_search_include_locales, settings.includeLocales+"").subscribe();
        }
        if (this.searchSettings.useAutocompletion != settings.useAutocompletion) {
            this.prefService.setPUSetting(Properties.pref_search_use_autocomplete, settings.useAutocompletion+"").subscribe();
        }
        this.searchSettings = settings;
        this.eventHandler.searchPrefsUpdatedEvent.emit();
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
        for (var i = 0; i < this.activeSchemes.length; i++) {
            if (this.activeSchemes[i].getNominalValue() == oldResource.getNominalValue()) {
                this.activeSchemes[i].setURI(newResource.getNominalValue());
                this.setActiveSchemes(this.activeSchemes);
                break;
            }
        }
    }

}