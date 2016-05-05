import {Injectable} from '@angular/core';
import {ARTURIResource} from './ARTResources';
import {Project} from './Project';
import {RDFResourceRolesEnum} from "./Enums";
import {Cookie} from "./Cookie";

@Injectable()
export class VocbenchCtx {

    private authToken: string; //if provided it means that the user is authenticated
    private workingProject: Project; //working project
    private ctxProject: Project; //project temporarly used in some context (e.g. exploring other projects)
    private sessionToken: string; //useful to keep track of session in some tools/scenarios (es. alignment validation)

    constructor() { }
    
    setAuthenticationToken(token: string) {
        this.authToken = token
    }
    
    getAuthenticationToken(): string {
        return this.authToken;
    }
    
    removeAutheticationToken() {
        this.authToken = undefined;
    }

    setWorkingProject(project: Project) {
        this.workingProject = project;
    }

    getWorkingProject(): Project {
        return this.workingProject;
    }
    
    removeWorkingProject() {
        this.workingProject = undefined;
    }
    
    setContextProject(project: Project) {
        this.ctxProject = project;
    }

    getContextProject(): Project {
        return this.ctxProject;
    }
    
    removeContextProject() {
        this.ctxProject = undefined;
    }

    /**
     * Saves the given scheme for the project in use as cookie
     */
    setScheme(scheme: ARTURIResource) {
        Cookie.setCookie(Cookie.VB_ACTIVE_SKOS_SCHEME + "_" + this.getWorkingProject().getName(), scheme.getURI(), 365*10);
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
     * Removes the scheme saved for the project in use as cookie
     */
    removeScheme() {
        Cookie.deleteCookie(Cookie.VB_ACTIVE_SKOS_SCHEME + "_" + this.getWorkingProject().getName());
    }
    
    setSessionToken(token: string) {
        this.sessionToken = token
    }
    
    getSessionToken(): string {
        return this.sessionToken;
    }
    
    removeSessionToken() {
        this.sessionToken = undefined;
    }
    
    setContentLanguage(langTag: string) {
        Cookie.setCookie(Cookie.VB_CONTENT_LANG, langTag, 365*10);
    }
    
    getContentLanguage() {
        return Cookie.getCookie(Cookie.VB_CONTENT_LANG);
    }

}