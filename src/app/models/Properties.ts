export class Properties {

    static pref_languages: string = "languages";
    static pref_active_schemes: string = "active_schemes";
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

    static setting_languages: string = "languages";
    static setting_remote_configs = "remote_configs";
    static setting_experimental_features_enabled = "experimental_features_enabled";

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
    public includeLocales: boolean;
    public useAutocompletion: boolean;
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

export class ClassTreePreference {
    rootClassUri: string;
    filterMap: { [key: string]: string[] }; //map where keys are the URIs of a class and the values are the URIs of the subClasses to filter out
    filterEnabled: boolean;
}