import {Injectable} from 'angular2/core';
import {ARTURIResource} from './ARTResources';

@Injectable()
export class VocbenchCtx {
    
    project: any;
    scheme: ARTURIResource;
    
	constructor() {
        this.project = { name : "SYSTEM" };
	}
    
    setProject(project) {
        this.project = project;
    }
    
    getProject() {
        return this.project;
    }
    
    setScheme(scheme: ARTURIResource) {
        this.scheme = scheme;
    }
    
    getScheme(): ARTURIResource {
        return this.scheme;
    }
    
}