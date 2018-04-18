export class Properties {

    static pref_languages: string = "languages";
    static pref_editing_language: string = "editing_language";
    static pref_active_schemes: string = "active_schemes";
    static pref_active_lexicon: string = "active_lexicon";
    static pref_show_flags: string = "show_flags";
    static pref_project_theme: string = "project_theme";
    static pref_show_instances_number: string = "show_instances_number";
    static pref_search_languages: string = "search_languages";
    static pref_search_restrict_lang: string = "search_restrict_lang";
    static pref_search_include_locales: string = "search_include_locales";
    static pref_search_use_autocomplete: string = "search_use_autocomplete";

    static pref_class_tree_filter_map: string = "class_tree_filter_map";
    static pref_class_tree_filter_enabled: string = "class_tree_filter_enabled";
    static pref_class_tree_root: string = "class_tree_root";

    static pref_concept_tree_base_broader_prop: string = "concept_tree_base_broader_prop";
    static pref_concept_tree_broader_props: string = "concept_tree_broader_props";
    static pref_concept_tree_narrower_props: string = "concept_tree_narrower_props";
    static pref_concept_tree_include_subprops: string = "concept_tree_include_subprops";
    static pref_concept_tree_sync_inverse: string = "concept_tree_sync_inverse";

    static setting_languages: string = "languages";
    static setting_remote_configs = "remote_configs";
    static setting_experimental_features_enabled = "experimental_features_enabled";

}

export enum ResourceViewMode {
    tabbed = "tabbed",
    splitted = "splitted"
}

export class SearchSettings {
    public stringMatchMode: StringMatchMode;
    public useURI: boolean;
    public useLocalName: boolean;
    public restrictLang: boolean;
    public languages: string[];
    public includeLocales: boolean;
    public useAutocompletion: boolean;
    public restrictActiveScheme: boolean;
    public classIndividualSearchMode: ClassIndividualPanelSearchMode;
}

export enum StringMatchMode {
    startsWith = "startsWith",
    contains = "contains",
    endsWith = "endsWith"
}

export enum ClassIndividualPanelSearchMode {
    onlyClasses = "onlyClasses",
    onlyInstances = "onlyInstances",
    all = "all"
}

export class ClassTreePreference {
    rootClassUri: string;
    filterMap: { [key: string]: string[] }; //map where keys are the URIs of a class and the values are the URIs of the subClasses to filter out
    filterEnabled: boolean;
}

export class ConceptTreePreference {
    baseBroaderUri: string;
    broaderProps: string[];
    narrowerProps: string[];
    includeSubProps: boolean; //tells if the hierarchy should consider
    syncInverse: boolean; //tells if the narrower/broader properties should be synced with their inverse
}