import { ARTResource, ARTURIResource } from '../models/ARTResources';
import { VersionInfo } from '../models/History';
import { PrefixMapping } from '../models/Metadata';
import { Project } from '../models/Project';
import { ProjectPreferences, ProjectSettings, SystemSettings } from '../models/Properties';
import { ProjectUserBinding, User } from '../models/User';
import { UIUtils } from "./UIUtils";

export class VBContext {

    private static workingProjectCtx: ProjectContext;
    private static projectChanged: boolean;
    private static loggedUser: User;

    private static systemSettings: SystemSettings = new SystemSettings();

    /**
     * If the project context is provided, returns (uses) it, otherwise returns the 'global' project context
     * @param projectCtx 
     */
    static getWorkingProjectCtx(projectCtx?: ProjectContext): ProjectContext {
        if (projectCtx != null) {
            return projectCtx;
        } else {
            return this.workingProjectCtx;
        }
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
     * Methods for managing the working graph (the graph that is set as ctx_wgraph requests parameter)
     */
    static setContextWGraph(wgraph: ARTResource) {
        this.workingProjectCtx.setContextWGraph(wgraph);
    }
    static getContextWGraph() {
        if (this.workingProjectCtx != null) {
            return this.workingProjectCtx.getContextWGraph();
        } else {
            return null;
        }
    }
    static removeContextWGraph() {
        this.workingProjectCtx.setContextWGraph(null);
    }
    static getActualWorkingGraph() {
        if (this.workingProjectCtx != null) {
            return this.workingProjectCtx.getContextWGraph() || new ARTURIResource(this.workingProjectCtx.getProject().getBaseURI());
        } else {
            return null;
        }
    }
    static getActualWorkingGraphString() {
        if (this.workingProjectCtx != null) {
            return this.workingProjectCtx.getContextWGraph()?.getNominalValue() || this.workingProjectCtx.getProject().getBaseURI();
        } else {
            return null;
        }
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
    private ctxWGraph: ARTResource; // write graph used, if not the projects' main graph
    private puBinging: ProjectUserBinding;
    private preferences: ProjectPreferences;
    private settings: ProjectSettings;

    constructor(project?: Project) {
        this.project = project;
        this.preferences = new ProjectPreferences();
        this.settings = new ProjectSettings();
    }

    setProject(project: Project) { this.project = project; }
    getProject(): Project { return this.project; }

    setPrefixMappings(mappings: PrefixMapping[]) { this.prefixMappings = mappings; }
    getPrefixMappings(): PrefixMapping[] { return this.prefixMappings; }

    setContextVersion(version: VersionInfo) { this.ctxVersion = version; }
    getContextVersion(): VersionInfo { return this.ctxVersion; }

    setContextWGraph(wgraph: ARTResource) { this.ctxWGraph = wgraph; }
    getContextWGraph(): ARTResource { return this.ctxWGraph; }
    
    setProjectUserBinding(puBinging: ProjectUserBinding) { this.puBinging = puBinging; }
    getProjectUserBinding(): ProjectUserBinding { return this.puBinging; }

    getProjectPreferences(): ProjectPreferences { return this.preferences; }

    getProjectSettings(): ProjectSettings { return this.settings; }
}