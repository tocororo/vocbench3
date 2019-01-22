import { VersionInfo } from '../models/History';
import { PrefixMapping } from '../models/Metadata';
import { Project } from '../models/Project';
import { ProjectUserBinding, User } from '../models/User';
import { UIUtils } from "./UIUtils";

class ProjectContext {
    private project: Project;
    private prefixMappings: PrefixMapping[];
    private ctxVersion: VersionInfo; // version used

    setProject(project: Project) { this.project = project; }
    getProject(): Project { return this.project; }

    setPrefixMappings(mappings: PrefixMapping[]) { this.prefixMappings = mappings; }
    getPrefixMappings(): PrefixMapping[] { return this.prefixMappings; }

    setContextVersion(version: VersionInfo) { this.ctxVersion = version; }
    getContextVersion(): VersionInfo { return this.ctxVersion; }

    reset() {
        this.project = null;
        this.prefixMappings = null;
        this.ctxVersion = null;
    }
}

export class VBContext {

    private static workingProjectCtx: ProjectContext = new ProjectContext();
    private static projectChanged: boolean;
    private static loggedUser: User;
    private static puBinging: ProjectUserBinding;

    /**
     * Methods for managing context project (project that is set as ctx_project requests parameter)
     */
    static setWorkingProject(project: Project) {
        this.workingProjectCtx.reset();
        this.puBinging = null;
        this.workingProjectCtx.setProject(project);
    }
    static getWorkingProject(): Project {
        return this.workingProjectCtx.getProject();
    }
    static removeWorkingProject() {
        this.workingProjectCtx.reset();
        this.puBinging = null;
        UIUtils.resetNavbarTheme(); //when quitting current project, reset the style to the default
    }

    /**
     * Methods for managing context version (version that is set as ctx_version requests parameter)
     */
    static setContextVersion(version: VersionInfo) {
        this.workingProjectCtx.setContextVersion(version);
    }
    static getContextVersion(): VersionInfo {
        return this.workingProjectCtx.getContextVersion();
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
        this.puBinging = null;
    }
    /**
     * Returns true if a user is logged in
     */
    static isLoggedIn(): boolean {
        return this.loggedUser != null;
    }

    static setProjectUserBinding(puBinging: ProjectUserBinding) {
        this.puBinging = puBinging;
    }
    static getProjectUserBinding(): ProjectUserBinding {
        return this.puBinging;
    }

    /**
     * Reset to null all the variable of the context
     */
    static resetContext() {
        this.workingProjectCtx.reset();
        this.loggedUser = null;
        this.puBinging = null;
    }

}


