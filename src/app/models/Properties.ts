import { ARTURIResource, RDFResourceRolesEnum } from "./ARTResources";
import { Language } from "./LanguagesCountries";
import { Project } from "./Project";
import { ResViewPartition } from "./ResourceView";
import { Sheet2RdfSettings } from './Sheet2RDF';
import { OWL, RDFS, SKOS } from "./Vocabulary";

/**
 * Names of the property of the Settings (at every levels: system, project, user, project-user)
 */
export enum SettingsEnum {
    activeLexicon = "activeLexicon",
    activeSchemes = "activeSchemes",
    authService = "authService",
    classTree = "classTree",
    conceptTree = "conceptTree",
    defaultConceptType = "defaultConceptType",
    defaultLexEntryType = "defaultLexEntryType",
    editingLanguage = "editingLanguage",
    emailVerification = "emailVerification",
    experimentalFeaturesEnabled = "experimentalFeaturesEnabled",
    filterValueLanguages = "filterValueLanguages",
    graphViewPartitionFilter = "graphViewPartitionFilter",
    hideLiteralGraphNodes = "hideLiteralGraphNodes",
    homeContent = "homeContent",
    instanceList = "instanceList",
    labelClashMode = "labelClashMode",
    languages = "languages",
    lexEntryList = "lexEntryList",
    mail = "mail",
    maxRowsTablePreview = "maxRowsTablePreview",
    notificationsStatus = "notificationsStatus",
    preload = "preload",
    privacyStatementAvailable = "privacyStatementAvailable",
    projectCreation = "projectCreation",
    projectTheme = "projectTheme",
    remoteConfigs = "remoteConfigs",
    resourceView = "resourceView",
    searchSettings = "searchSettings",
    sheet2rdfSettings = "sheet2rdfSettings",
    showFlags = "showFlags",
    timeMachineEnabled = "timeMachineEnabled",
}

export class PreferencesUtils {
    /**
     * Merge the default preferences object with the one returned by the Settings.getSettings() service
     * Useful to keep the default values to those properties not set and thus not returned by the above service.
     * @param localPref 
     * @param settingsProperty 
     */
    public static mergePreference(localPref: any, settingsProperty: any) {
        Object.keys(localPref).forEach(prop => {
            if (settingsProperty[prop] != null) {
                localPref[prop] = settingsProperty[prop];
            }
        })
    }
}

export class ResourceViewPreference {
    mode: ResourceViewMode = ResourceViewMode.tabbed; 
    syncTabs: boolean = false; //in tabbed mode allows to keep sync'd the resource in the active tab with the same resource in the tree/list
    defaultConceptType: ResourceViewType = ResourceViewType.resourceView; //tells the RV type to be open by default for concepts
    lastConceptType: ResourceViewType;
    defaultLexEntryType: ResourceViewType = ResourceViewType.resourceView; //tells the RV type to be open by default for lexEntry
    lastLexEntryType: ResourceViewType;
    displayImg: boolean = false;
    resViewPartitionFilter: PartitionFilterPreference = {};
    rendering: boolean = true;
    inference: boolean = false;
    showDeprecated: boolean = true;
    showDatatypeBadge: boolean = false;
    sortByRendering: boolean = false; //use the same rendering language order for sorting value in lexicalizations partition
}

export enum ResourceViewMode {
    tabbed = "tabbed",
    splitted = "splitted"
}

export enum ResourceViewType { //used for set a default type of resource view for concepts
    resourceView = "resourceView",
    termView = "termView",
    lexicographerView = "lexicographerView",
    sourceCode = "sourceCode"
}

export class ResourceViewProjectSettings {
    customSections: {[key: string]: CustomSection} = {}; //map name -> CustomSection
    templates: {[key: string]: ResViewPartition[]} = {}; //map role -> sections
}

export class CustomSection {
    matchedProperties: string[];
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
    filter: ClassTreeFilter = { enabled: true, map: {} };
    showInstancesNumber: boolean;

    constructor(project: Project) {
        let modelType = project.getModelType();
        this.rootClassUri = modelType == RDFS.uri ? RDFS.resource.getURI() : OWL.thing.getURI();
        this.showInstancesNumber = modelType == RDFS.uri || modelType == OWL.uri;
    }
}
export class ClassTreeFilter {
    enabled: boolean = true;
    map:  { [key: string]: string[] } = {}; //map where keys are the URIs of a class and the values are the URIs of the subClasses to filter out
}

export class ConceptTreePreference {
    baseBroaderProp: string = SKOS.broader.getURI();
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

export enum PrefLabelClashMode {
    forbid = "forbid", //always forbid
    warning = "warning", //warn user about the clash and allows to force
    allow = "allow" //always allow
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
    safeToGoLimit: number = 1000;
    safeToGoMap: SafeToGoMap = {}; //this is not a preference, but it is cached with them since it is contextual to the project 
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
    renderingLanguagesPreference: string[] = []; //languages that user has assigned for project (and ordered according his preferences)

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

    sheet2RdfSettings: Sheet2RdfSettings;

    notificationStatus: NotificationStatus = NotificationStatus.no_notifications;
}

/**
 * Class that represents the settings of a project (user indipendent)
 */
export class ProjectSettings {
    projectLanguagesSetting: Language[] = []; //all available languages in a project (settings)
    prefLabelClashMode: PrefLabelClashMode = PrefLabelClashMode.forbid;
    resourceView: ResourceViewProjectSettings;
    timeMachineEnabled: boolean = true;
}

/**
 * Class that represents the global application settings
 */
export class SystemSettings {
    experimentalFeaturesEnabled: boolean = false;
    privacyStatementAvailable: boolean = false;
    showFlags: boolean = true;
    homeContent: string;
    languages: Language[];
    emailVerification: boolean = false;
    authService: AuthServiceMode = AuthServiceMode.Default;
}

export class ProjectCreationPreferences {
    aclUniversalAccessDefault: boolean = false;
    openAtStartUpDefault: boolean = false;
}

export class VisualizationModeTranslation {
    static translationMap: {[key: string]: string} = {
        [ConceptTreeVisualizationMode.hierarchyBased]: "DATA.COMMONS.VISUALIZATION_MODE.HIERARCHY_BASED",
        [ConceptTreeVisualizationMode.searchBased]: "DATA.COMMONS.VISUALIZATION_MODE.SEARCH_BASED",
        [LexEntryVisualizationMode.indexBased]: "DATA.COMMONS.VISUALIZATION_MODE.INDEX_BASED",
        [LexEntryVisualizationMode.searchBased]: "DATA.COMMONS.VISUALIZATION_MODE.SEARCH_BASED",
        [InstanceListVisualizationMode.searchBased]: "DATA.COMMONS.VISUALIZATION_MODE.SEARCH_BASED",
        [InstanceListVisualizationMode.standard]: "DATA.COMMONS.VISUALIZATION_MODE.STANDARD"
    }
}

export enum AuthServiceMode {
    Default = "Default",
    SAML = "SAML",
}