import {Injectable} from 'angular2/core';
import {ARTURIResource} from './ARTResources';
import {Project} from './Project';

@Injectable()
export class VocbenchCtx {

    private authToken 
    private project: Project;
    private scheme: ARTURIResource;

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

    setProject(project: Project) {
        this.project = project;
    }

    getProject(): Project {
        return this.project;
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