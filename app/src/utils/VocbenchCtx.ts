import {Injectable} from 'angular2/core';

@Injectable()
export class VocbenchCtx {
    
    project: string;
    
	constructor() {
        
	}
    
    setProject(project: string) {
        this.project = project;
    }
    
    getProject() : string {
        return this.project;
    }
    
}