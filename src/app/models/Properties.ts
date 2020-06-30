import { ARTURIResource } from "./ARTResources";
import { Language } from "./LanguagesCountries";
import { ResViewPartition } from "./ResourceView";
import { SKOS } from "./Vocabulary";

export class Properties {

    static pref_languages: string = "languages";
    static pref_editing_language: string = "editing_language";
    static pref_filter_value_languages: string = "filter_value_languages";
    static pref_active_schemes: string = "active_schemes";
    static pref_active_lexicon: string = "active_lexicon";
    static pref_show_flags: string = "show_flags";
    static pref_project_theme: string = "project_theme";
    static pref_show_instances_number: string = "show_instances_number";

    static pref_search_languages: string = "search_languages";
    static pref_search_restrict_lang: string = "search_restrict_lang";
    static pref_search_include_locales: string = "search_include_locales";
    static pref_search_use_autocomplete: string = "search_use_autocomplete";

    static pref_class_tree_root: string = "class_tree_root";
    static pref_class_tree_filter: string = "class_tree_filter";

    static pref_concept_tree_base_broader_prop: string = "concept_tree_base_broader_prop";
    static pref_concept_tree_broader_props: string = "concept_tree_broader_props";
    static pref_concept_tree_narrower_props: string = "concept_tree_narrower_props";
    static pref_concept_tree_include_subprops: string = "concept_tree_include_subprops";
    static pref_concept_tree_sync_inverse: string = "concept_tree_sync_inverse";
    static pref_concept_tree_visualization: string = "concept_tree_visualization";
    static pref_concept_tree_multischeme_mode: string = "concept_tree_multischeme_mode";
    static pref_concept_tree_safe_to_go_limit: string = "concept_tree_safe_to_go_limit";

    static pref_instance_list_visualization: string = "instance_list_visualization";

    static pref_lex_entry_list_visualization: string = "lex_entry_list_visualization";
    static pref_lex_entry_list_index_lenght: string = "lex_entry_list_index_lenght";
    static pref_lex_entry_list_safe_to_go_limit: string = "lex_entry_list_safe_to_go_limit";

    static pref_res_view_partition_filter: string = "rv_partition_filter";
    static pref_res_view_default_concept_type: string = "res_view_default_concept_type";

    static pref_graph_view_partition_filter: string = "graph_partition_filter";
    static pref_hide_literal_graph_nodes: string = "hide_literal_graph_nodes";

    static pref_s2rdf_use_headers: string = "s2rdf_use_headers";
    static pref_s2rdf_fs_naming_strategy: string = "s2rdf_fs_naming_strategy";

    static pref_notifications_status: string = "notifications_status";

    static setting_languages: string = "languages";
    static setting_remote_configs = "remote_configs";
    static setting_experimental_features_enabled = "experimental_features_enabled";
    static setting_home_content = "home_content"

    static privacy_statement_available = "privacy_statement_available"
    
}

export class ResourceViewPreference {
    mode: ResourceViewMode = ResourceViewMode.tabbed; 
    syncTabs: boolean = false; //in tabbed mode allows to keep sync'd the resource in the active tab with the same resource in the tree/list
    defaultConceptType: ResourceViewType = ResourceViewType.resourceView; //tells the RV type to be open by default for concepts
    lastConceptType: ResourceViewType;
    displayImg: boolean = false;
    resViewPartitionFilter: PartitionFilterPreference;
    rendering: boolean = true;
    inference: boolean = false;
}

export enum ResourceViewMode {
    tabbed = "tabbed",
    splitted = "splitted"
}

export enum ResourceViewType { //used for set a default type of resource view for concepts
    resourceView = "resourceView",
    termView = "termView",
    sourceCode = "sourceCode"
}

export class SearchSettings {
    stringMatchMode: SearchMode = SearchMode.startsWith;
    useURI: boolean = false;
    useLocalName: boolean = true;
    useNotes: boolean = false;
    restrictLang: boolean = false;
    languages: string[] = [];
    includeLocales: boolean = false;
    useAutocompletion: boolean = false;
    restrictActiveScheme: boolean = true;
    extendToAllIndividuals: boolean = false;
}

export enum SearchMode {
    startsWith = "startsWith",
    contains = "contains",
    endsWith = "endsWith",
    exact = "exact",
    fuzzy = "fuzzy"
}

export enum StatusFilter {
    NOT_DEPRECATED = "NOT_DEPRECATED",
    ONLY_DEPRECATED = "ONLY_DEPRECATED",
    UNDER_VALIDATION = "UNDER_VALIDATION",
    UNDER_VALIDATION_FOR_DEPRECATION = "UNDER_VALIDATION_FOR_DEPRECATION",
    ANYTHING = "ANYTHING",
} 

export class ClassTreePreference {
    rootClassUri: string;
    filter: ClassTreeFilter;
    showInstancesNumber: boolean
}
export class ClassTreeFilter {
    enabled: boolean;
    map:  { [key: string]: string[] }; //map where keys are the URIs of a class and the values are the URIs of the subClasses to filter out
}

export class ConceptTreePreference {
    baseBroaderUri: string = SKOS.broader.getURI();
    broaderProps: string[] = [];
    narrowerProps: string[] = [];
    includeSubProps: boolean = true; //tells if the hierarchy should consider
    syncInverse: boolean = true; //tells if the narrower/broader properties should be synced with their inverse
    visualization: ConceptTreeVisualizationMode = ConceptTreeVisualizationMode.hierarchyBased;
    multischemeMode: MultischemeMode = MultischemeMode.or;
    safeToGoLimit: number = 1000;
    safeToGoMap: SafeToGoMap = {}; //this is not a preference, but it is cached with them since it is contextual to the project 
}

/**
 * checksum: string - it is a representation of the request params (it could be a concat of the params serialization)
 * safe: boolean tells if the tree/list is safe to be initialized, namely if the amount of elements (root/items) are under a safety limit
 */
export interface SafeToGoMap { [checksum: string]: SafeToGo };
export interface SafeToGo { safe: boolean, count?: number };

export enum ConceptTreeVisualizationMode {
    searchBased = "searchBased",
    hierarchyBased = "hierarchyBased"
}

export enum MultischemeMode { //tells if the multi-scheme are considered in AND or in OR when browsing the concept tree
    and = "and",
    or = "or"
}

export class LexicalEntryListPreference {
    visualization: LexEntryVisualizationMode = LexEntryVisualizationMode.indexBased;
    indexLength: number = 1;
    safeToGoLimit: number = 1000;
    safeToGoMap: SafeToGoMap = {}; //this is not a preference, but it is cached with them since it is contextual to the project 
}

export enum LexEntryVisualizationMode {
    searchBased = "searchBased",
    indexBased = "indexBased"
}

export class InstanceListPreference {
    visualization: InstanceListVisualizationMode = InstanceListVisualizationMode.standard;
}

export enum InstanceListVisualizationMode {
    searchBased = "searchBased",
    standard = "standard"
}

export class ValueFilterLanguages {
    languages: string[];
    enabled: boolean;
}

export class PartitionFilterPreference {
    [role: string]: ResViewPartition[]; //role is a RDFResourceRoleEnum, values are only the hidden partitions
}

export enum NotificationStatus {
    no_notifications = "no_notifications",
    in_app_only = "in_app_only",
    email_instant = "email_instant",
    email_daily_digest = "email_daily_digest",
}

/**
 * Class that represents the user settings (preferences) of a Project 
 */
export class ProjectPreferences {
    projectLanguagesPreference: string[] = []; //languages that user has assigned for project (and ordered according his preferences)

    editingLanguage: string; //default editing language
    filterValueLang: ValueFilterLanguages; //languages visible in resource description (e.g. in ResourceView, Graph,...)

    activeSchemes: ARTURIResource[] = [];
    activeLexicon: ARTURIResource;
    showFlags: boolean = true;
    projectThemeId: number = null;

    classTreePreferences: ClassTreePreference;
    instanceListPreferences: InstanceListPreference;
    conceptTreePreferences: ConceptTreePreference;
    lexEntryListPreferences: LexicalEntryListPreference;

    resViewPreferences: ResourceViewPreference;

    //graph preferences
    graphViewPartitionFilter: PartitionFilterPreference;
    hideLiteralGraphNodes: boolean = true;

    searchSettings: SearchSettings;

    notificationStatus: NotificationStatus = NotificationStatus.no_notifications;
}

/**
 * Class that represents the settings of a project (user indipendent)
 */
export class ProjectSettings {
    projectLanguagesSetting: Language[] = []; //all available languages in a project (settings)
}

/**
 * Class that represents the global application settings
 */
export class SystemSettings {
    experimentalFeaturesEnabled: boolean = false;
    privacyStatementAvailable: boolean = false;
    showFlags: boolean = true;
    homeContent: string;
}