import {Injectable} from 'angular2/core';
import {ARTURIResource} from './ARTResources';
import {Project} from './Project';

@Injectable()
export class VocbenchCtx {

    project: Project;
    scheme: ARTURIResource;

    constructor() { }

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