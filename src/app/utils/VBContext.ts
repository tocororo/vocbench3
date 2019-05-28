import { VersionInfo } from '../models/History';
import { PrefixMapping } from '../models/Metadata';
import { Project } from '../models/Project';
import { ProjectUserBinding, User } from '../models/User';
import { UIUtils } from "./UIUtils";
import { Language } from '../models/LanguagesCountries';
import { ValueFilterLanguages, ClassTreePreference, ConceptTreePreference, LexicalEntryListPreference, ResViewPartitionFilterPreference, SearchSettings, SearchMode, ClassIndividualPanelSearchMode } from '../models/Properties';
import { ARTURIResource } from '../models/ARTResources';

export class VBContext {

    private static workingProjectCtx: ProjectContext;
    private static projectChanged: boolean;
    private static loggedUser: User;

    private static systemSettings: SystemSettings = {
        experimentalFeaturesEnabled: false,
        privacyStatementAvailable: false,
        showFlags: true
    }

    static getWorkingProjectCtx(): ProjectContext {
        return this.workingProjectCtx;
    }

    /**
     * Methods for managing context project (project that is set as ctx_project requests parameter)
     */
    static setWorkingProject(project: Project) {
        this.workingProjectCtx = new ProjectContext();
        this.workingProjectCtx.setProject(project);
    }
    static getWorkingProject(): Project {
        if (this.workingProjectCtx != null) {
            return this.workingProjectCtx.getProject();
        } else {
            return null;
        }
    }
    static removeWorkingProject() {
        this.workingProjectCtx = null;
        UIUtils.resetNavbarTheme(); //when quitting current project, reset the style to the default
    }

    /**
     * Methods for managing context version (version that is set as ctx_version requests parameter)
     */
    static setContextVersion(version: VersionInfo) {
        this.workingProjectCtx.setContextVersion(version);
    }
    static getContextVersion(): VersionInfo {
        if (this.workingProjectCtx != null) {
            return this.workingProjectCtx.getContextVersion();
        } else {
            return null;
        }
    }
    static removeContextVersion() {
        this.workingProjectCtx.setContextVersion(null);
    }

    /**
     * When project changes set a flag in the context, so the CustomReuseStrategy knows if to reattach or reload a route
     */
    static setProjectChanged(changed: boolean) {
        this.projectChanged = changed;
    }
    static resetProjectChanged() {
        this.projectChanged = false;
    }
    static isProjectChanged() {
        return this.projectChanged;
    }

    static setPrefixMappings(prefixMappings: PrefixMapping[]) {
        this.workingProjectCtx.setPrefixMappings(prefixMappings);
    }
    static getPrefixMappings(): PrefixMapping[] {
        return this.workingProjectCtx.getPrefixMappings();
    }

    static setLoggedUser(user: User) {
        this.loggedUser = user;
    }
    static getLoggedUser(): User {
        return this.loggedUser;
    }
    static removeLoggedUser() {
        this.loggedUser = null;
    }
    /**
     * Returns true if a user is logged in
     */
    static isLoggedIn(): boolean {
        return this.loggedUser != null;
    }

    static setProjectUserBinding(puBinging: ProjectUserBinding) {
        this.workingProjectCtx.setProjectUserBinding(puBinging);
    }
    static getProjectUserBinding(): ProjectUserBinding {
        return this.workingProjectCtx.getProjectUserBinding();
    }

    static getSystemSettings(): SystemSettings {
        return this.systemSettings;
    }

    /**
     * Reset to null all the variable of the context
     */
    static resetContext() {
        this.workingProjectCtx = null;
        this.loggedUser = null;
    }

}

export class ProjectContext { //TODO move to Project model class?
    private project: Project;
    private prefixMappings: PrefixMapping[];
    private ctxVersion: VersionInfo; // version used
    private puBinging: ProjectUserBinding;
    private preferences: ProjectPreferences;
    private settings: ProjectSettings;

    constructor() {
        this.preferences = new ProjectPreferences();
        this.settings = new ProjectSettings();
    }

    setProject(project: Project) { this.project = project; }
    getProject(): Project { return this.project; }

    setPrefixMappings(mappings: PrefixMapping[]) { this.prefixMappings = mappings; }
    getPrefixMappings(): PrefixMapping[] { return this.prefixMappings; }

    setContextVersion(version: VersionInfo) { this.ctxVersion = version; }
    getContextVersion(): VersionInfo { return this.ctxVersion; }

    setProjectUserBinding(puBinging: ProjectUserBinding) { this.puBinging = puBinging; }
    getProjectUserBinding(): ProjectUserBinding { return this.puBinging; }

    getProjectPreferences(): ProjectPreferences { return this.preferences; }

    getProjectSettings(): ProjectSettings { return this.settings; }
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
    showInstancesNumber: boolean = true;
    projectThemeId: number = null;

    classTreePreferences: ClassTreePreference;
    conceptTreePreferences: ConceptTreePreference;
    lexEntryListPreferences: LexicalEntryListPreference;

    //graph preferences
    resViewPartitionFilter: ResViewPartitionFilterPreference;
    hideLiteralGraphNodes: boolean = true;

    searchSettings: SearchSettings;
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
    experimentalFeaturesEnabled: boolean;
    privacyStatementAvailable: boolean;
    showFlags: boolean;
}