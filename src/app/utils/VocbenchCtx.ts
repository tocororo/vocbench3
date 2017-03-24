import { Injectable } from '@angular/core';
import { ARTURIResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { Project } from '../models/Project';
import { PrefixMapping } from '../models/PrefixMapping';
import { User } from '../models/User';
import { Cookie } from "./Cookie";

@Injectable()
export class VocbenchCtx {

    private workingProject: Project; //working project
    private defaultNamespace: string; //namespace of the current working project
    private prefixMappings: PrefixMapping[];
   
    private ctxProject: Project; //project temporarly used in some scenarios (e.g. exploring other projects)
    private sessionToken: string; //useful to keep track of session in some tools/scenarios (es. alignment validation)
    private loggedUser: User;

    constructor() { }

    /**
     * Sets the working project (the one set as ctx_project requests parameter)
     */
    setWorkingProject(project: Project) {
        this.workingProject = project;
    }
    /**
     * Gets the working project (the one set as ctx_project requests parameter)
     */
    getWorkingProject(): Project {
        return this.workingProject;
    }
    /**
     * Removes the working project (the one set as ctx_project requests parameter)
     */
    removeWorkingProject() {
        this.workingProject = null;
        this.defaultNamespace = null;
        this.prefixMappings = null;
    }

    //there is no removeDefaultNamespace since it is remove with the working project (see removeWorkingProject)
    setDefaultNamespace(ns: string) {
        this.defaultNamespace = ns;
    }
    getDefaultNamespace(): string {
        return this.defaultNamespace;
    }

    setPrefixMappings(prefixMappings: PrefixMapping[]) {
        this.prefixMappings = prefixMappings;
    }
    getPrefixMappings(): PrefixMapping[] {
        return this.prefixMappings;
    }

    /**
     * Sets a contextual project (project temporarly used in some scenarios)
     */
    setContextProject(project: Project) {
        this.ctxProject = project;
    }
    /**
     * Gets a contextual project (project temporarly used in some scenarios)
     */
    getContextProject(): Project {
        return this.ctxProject;
    }

    /**
     * Removes a contextual project (project temporarly used in some scenarios)
     */
    removeContextProject() {
        this.ctxProject = undefined;
    }

    setLoggedUser(user: User) {
        this.loggedUser = user;
    }
    getLoggedUser(): User {
        return this.loggedUser;
    }
    removeLoggedUser() {
        this.loggedUser = undefined;
    }
    /**
     * Returns true if a user is logged in
     */
    isLoggedIn(): boolean {
        return this.loggedUser != undefined;
    }

    /**
     * Saves the given scheme for the project in use as cookie
     */
    setScheme(scheme: ARTURIResource) {
        Cookie.setCookie(Cookie.VB_ACTIVE_SKOS_SCHEME + "_" + this.getWorkingProject().getName(), scheme.getURI(), 365 * 10);
    }
    /**
     * Returns the scheme saved for the project in use as cookie.
     * Note: returns an ARTURIResource with show null
     */
    getScheme(): ARTURIResource {
        var schemeCookie = Cookie.getCookie(Cookie.VB_ACTIVE_SKOS_SCHEME + "_" + this.getWorkingProject().getName());
        if (schemeCookie != null) {
            return new ARTURIResource(schemeCookie, null, RDFResourceRolesEnum.conceptScheme);
        } else {
            return null;
        }
    }
    /**
     * Removes the scheme saved for the given project
     */
    removeScheme(project: Project) {
        Cookie.deleteCookie(Cookie.VB_ACTIVE_SKOS_SCHEME + "_" + project.getName());
    }

    /**
     * Sets a sessione token (to keep track of session in some tools/scenarios)
     */
    setSessionToken(token: string) {
        this.sessionToken = token
    }
    /**
     * Gets a sessione token (to keep track of session in some tools/scenarios)
     */
    getSessionToken(): string {
        return this.sessionToken;
    }
    /**
     * Removes a sessione token (to keep track of session in some tools/scenarios)
     */
    removeSessionToken() {
        this.sessionToken = undefined;
    }

    /**
     * Sets the preference to show or hide the inferred information in resource view
     */
    setInferenceInResourceView(showInferred: boolean) {
        Cookie.setCookie(Cookie.VB_INFERENCE_IN_RES_VIEW, showInferred + "", 365 * 10);
    }
    /**
     * Gets the preference to show or hide the inferred information in resource view
     */
    getInferenceInResourceView() {
        return Cookie.getCookie(Cookie.VB_INFERENCE_IN_RES_VIEW) == "true";
    }

    /**
     * Removes the settings saved as cookie for the given project
     */
    removeProjectSetting(project: Project) {
        Cookie.deleteCookie(Cookie.VB_ACTIVE_SKOS_SCHEME + "_" + project.getName());
    }

    /**
     * Reset to null all the variable of the context
     */
    resetContext() {
        this.workingProject = null;
        this.defaultNamespace = null;
        this.prefixMappings = null;
        this.ctxProject = null;
        this.sessionToken = null;
        this.loggedUser = null;
    }

}