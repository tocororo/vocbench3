import { ARTURIResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { Project } from '../models/Project';
import { VersionInfo } from '../models/History';
import { PrefixMapping } from '../models/Metadata';
import { CollaborationCtx } from '../models/Collaboration';
import { User, ProjectUserBinding } from '../models/User';
import { UIUtils } from "./UIUtils";
import { Cookie } from "./Cookie";

class ProjectContext {
    private project: Project;
    private defaultNamespace: string;
    private prefixMappings: PrefixMapping[];

    setProject(project: Project) { this.project = project; }
    getProject(): Project { return this.project; }

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
    private static ctxVersion: VersionInfo; // version used
    private static projectChanged: boolean;
    private static loggedUser: User;
    private static puBinging: ProjectUserBinding;
    private static collaborationCtx: CollaborationCtx = new CollaborationCtx();

    /**
     * Methods for managing context project (project that is set as ctx_project requests parameter)
     */
    static setWorkingProject(project: Project) {
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
        this.ctxVersion = version;
    }
    static getContextVersion(): VersionInfo {
        return this.ctxVersion;
    }
    static removeContextVersion() {
        this.ctxVersion = null;
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


    static getCollaborationCtx(): CollaborationCtx {
        return this.collaborationCtx;
    }

    /**
     * Reset to null all the variable of the context
     */
    static resetContext() {
        this.workingProjectCtx.reset();
        // this.ctxProject = null;
        // this.sessionToken = null;
        this.loggedUser = null;
        this.puBinging = null;
    }

}


