import { ARTURIResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { Project } from '../models/Project';
import { VersionInfo } from '../models/History';
import { PrefixMapping } from '../models/PrefixMapping';
import { User } from '../models/User';
import { Cookie } from "./Cookie";

class ProjectContext {
    private project: Project;
    private defaultNamespace: string;
    private prefixMappings: PrefixMapping[];

    setProject(project: Project) { this.project = project; }
    getProject(): Project { return this.project; }

    setDefaultNamespace(namespace: string) { this.defaultNamespace = namespace; }
    getDefaultNamespace(): string { return this.defaultNamespace; }

    setPrefixMappings(mappings: PrefixMapping[]) { this.prefixMappings = mappings; }
    getPrefixMappings(): PrefixMapping[] { return this.prefixMappings; }

    reset() {
        this.project = null;
        this.defaultNamespace = null;
        this.prefixMappings = null;
    }
}

export class VBContext {

    private static workingProjectCtx: ProjectContext = new ProjectContext();
    private static projectChanged: boolean;
    private static ctxProject: Project; //project temporarly used in some scenarios (e.g. exploring other projects)
    private static ctxVersion: VersionInfo; //version used
    private static sessionToken: string; //useful to keep track of session in some tools/scenarios (es. alignment validation)
    private static loggedUser: User;

    /**
     * Sets the working project (the one set as ctx_project requests parameter)
     */
    static setWorkingProject(project: Project) {
        this.workingProjectCtx.setProject(project);
    }
    /**
     * Gets the working project (the one set as ctx_project requests parameter)
     */
    static getWorkingProject(): Project {
        return this.workingProjectCtx.getProject();
    }
    /**
     * Removes the working project (the one set as ctx_project requests parameter)
     */
    static removeWorkingProject() {
        this.workingProjectCtx.reset();
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

    //there is no removeDefaultNamespace since it is remove with the working project (see removeWorkingProject)
    static setDefaultNamespace(ns: string) {
        this.workingProjectCtx.setDefaultNamespace(ns);
    }
    static getDefaultNamespace(): string {
        return this.workingProjectCtx.getDefaultNamespace();
    }

    static setPrefixMappings(prefixMappings: PrefixMapping[]) {
        this.workingProjectCtx.setPrefixMappings(prefixMappings);
    }
    static getPrefixMappings(): PrefixMapping[] {
        return this.workingProjectCtx.getPrefixMappings();
    }

    /**
     * Sets a contextual project (project temporarly used in some scenarios)
     */
    static setContextProject(project: Project) {
        this.ctxProject = project;
    }
    /**
     * Gets a contextual project (project temporarly used in some scenarios)
     */
    static getContextProject(): Project {
        return this.ctxProject;
    }
    /**
     * Removes a contextual project (project temporarly used in some scenarios)
     */
    static removeContextProject() {
        this.ctxProject = null;
    }


    static setContextVersion(version: VersionInfo) {
        this.ctxVersion = version;
    }
    static getContextVersion(): VersionInfo {
        return this.ctxVersion;
    }
    static removeContextVersion() {
        this.ctxVersion = null;
    }
    

    static setLoggedUser(user: User) {
        this.loggedUser = user;
    }
    static getLoggedUser(): User {
        return this.loggedUser;
    }
    static removeLoggedUser() {
        this.loggedUser = undefined;
    }
    /**
     * Returns true if a user is logged in
     */
    static isLoggedIn(): boolean {
        return this.loggedUser != undefined;
    }

    /**
     * Sets a sessione token (to keep track of session in some tools/scenarios)
     */
    static setSessionToken(token: string) {
        this.sessionToken = token
    }
    /**
     * Gets a sessione token (to keep track of session in some tools/scenarios)
     */
    static getSessionToken(): string {
        return this.sessionToken;
    }
    /**
     * Removes a sessione token (to keep track of session in some tools/scenarios)
     */
    static removeSessionToken() {
        this.sessionToken = undefined;
    }

    /**
     * Reset to null all the variable of the context
     */
    static resetContext() {
        this.workingProjectCtx.reset();
        this.ctxProject = null;
        this.sessionToken = null;
        this.loggedUser = null;
    }

}


