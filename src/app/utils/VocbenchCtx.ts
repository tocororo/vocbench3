import {Injectable} from '@angular/core';
import {ARTURIResource, RDFResourceRolesEnum} from './ARTResources';
import {Project} from './Project';
import {Cookie} from "./Cookie";
import {User} from './User';

@Injectable()
export class VocbenchCtx {

    private workingProject: Project; //working project
    private defaultNamespace: string; //namespace of the current working project
    private ctxProject: Project; //project temporarly used in some context (e.g. exploring other projects)
    private sessionToken: string; //useful to keep track of session in some tools/scenarios (es. alignment validation)
    private loggedUser: User;

    constructor() { }
    
    setWorkingProject(project: Project) {
        this.workingProject = project;
    }

    getWorkingProject(): Project {
        return this.workingProject;
    }
    
    removeWorkingProject() {
        this.workingProject = undefined;
        this.defaultNamespace = undefined;
    }

    //there is no removeDefaultNamespace since it is remove with the working project (see removeWorkingProject)
    setDefaultNamespace(ns: string) {
        this.defaultNamespace = ns;
    }

    getDefaultNamespace(): string {
        return this.defaultNamespace;
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
     * If no language is set, return "en" as default.
     * @param checkHumanReadable if true, returns the content language only if the humanReadable option is set to true
     */
    getContentLanguage(checkHumanReadable?: boolean): string {
        var contLang: string;
        if (checkHumanReadable) { //human readable required: return content language only if humanReadable is true
            var humanReadable: boolean = this.getHumanReadable();
            if (humanReadable) {
                if (this.getWorkingProject() != undefined) {
                    var contLang = Cookie.getCookie(Cookie.VB_CONTENT_LANG + "_" + this.getWorkingProject().getName());
                }
                if (contLang == null) {
                    contLang = "en"; //default lang
                }
            }
        } else { //no humanReadable required, return the content language
            if (this.getWorkingProject() != undefined) {
                var contLang = Cookie.getCookie(Cookie.VB_CONTENT_LANG + "_" + this.getWorkingProject().getName());
            }
            if (contLang == null) {
                contLang = "en"; //default lang
            }
        }
        return contLang;
    }

    /**
     * Sets the human_readable cookie in order to enable/disable the human readable label.
     * The language of the labels is then determined by the content language.
     */
    setHumanReadable(humanReadable: boolean) {
        Cookie.setCookie(Cookie.VB_HUMAN_READABLE + "_" + this.getWorkingProject().getName(), humanReadable + "", 365*10);
    }
    
    /**
     * Returns the human_readable cookie that tells if the resources in trees should be rendered with human readable labels.
     */
    getHumanReadable(): boolean {
        return Cookie.getCookie(Cookie.VB_HUMAN_READABLE + "_" + this.getWorkingProject().getName()) == "true";
    }
    
    /**
     * Sets the preference to show or hide the inferred information in resource view
     */
    setInferenceInResourceView(showInferred: boolean) {
        Cookie.setCookie(Cookie.VB_INFERENCE_IN_RES_VIEW, showInferred + "", 365*10);
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
        Cookie.deleteCookie(Cookie.VB_CONTENT_LANG + "_" + project.getName());
        Cookie.deleteCookie(Cookie.VB_HUMAN_READABLE + "_" + project.getName());
    }

    /**
     * Returns true if a user is logged in
     */
    isLoggedIn(): boolean {
        return this.loggedUser != undefined;
    }

}