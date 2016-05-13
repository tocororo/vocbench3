import {Injectable} from '@angular/core';
import {ARTURIResource, RDFResourceRolesEnum} from './ARTResources';
import {Project} from './Project';
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
     * Removes the scheme saved for the given project
     */
    removeScheme(project: Project) {
        Cookie.deleteCookie(Cookie.VB_ACTIVE_SKOS_SCHEME + "_" + project.getName());
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
    
    /**
     * Sets the content language for project in use as cookie.
     */
    setContentLanguage(langTag: string) {
        Cookie.setCookie(Cookie.VB_CONTENT_LANG + "_" + this.getWorkingProject().getName(), langTag, 365*10);
    }
    
    /**
     * Returns the content language for project in use set as cookie.
     * If no language is set, return "en" as default
     */
    getContentLanguage() {
        // return Cookie.getCookie(Cookie.VB_CONTENT_LANG + "_" + this.getWorkingProject().getName());
        var contLang: string;
        if (this.getWorkingProject() != undefined) {
            var contLang = Cookie.getCookie(Cookie.VB_CONTENT_LANG + "_" + this.getWorkingProject().getName());
        }
        if (contLang == null) {
            contLang = "en"; //default lang
        }
        return contLang;
    }

}