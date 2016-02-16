import {Injectable} from 'angular2/core';
import {ARTURIResource} from './ARTResources';

@Injectable()
export class VocbenchCtx {
    
    project: string;
    scheme: ARTURIResource;
    
	constructor() {
        this.project = "SYSTEM";
	}
    
    setProject(project: string) {
        this.project = project;
    }
    
    getProject(): string {
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