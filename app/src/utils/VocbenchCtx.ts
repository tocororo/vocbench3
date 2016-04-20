import {Injectable} from 'angular2/core';
import {ARTURIResource} from './ARTResources';
import {Project} from './Project';

@Injectable()
export class VocbenchCtx {

    private authToken; //if provided it means that the user is authenticated
    private workingProject: Project; //working project
    private ctxProject: Project; //project temporarly used in some context (e.g. exploring other projects)
    private scheme: ARTURIResource; //working scheme (used only in SKOS(-XL) projects)

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
    
    setContextProject(project: Project) {
        this.ctxProject = project;
    }

    getContextProject(): Project {
        return this.ctxProject;
    }
    
    removeContextProject() {
        this.ctxProject = undefined;
    }

    setScheme(scheme: ARTURIResource) {
        this.scheme = scheme;
    }

    getScheme(): ARTURIResource {
        return this.scheme;
    }

    removeScheme() {
        this.scheme = undefined;
    }

}