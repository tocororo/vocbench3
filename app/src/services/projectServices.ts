import {Injectable} from 'angular2/core';
import {Http} from 'angular2/http';
import 'rxjs/add/operator/map'; //CHECK IF THIS STILL BE NEEDED IN FUTURE VERSION

import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class ProjectServices {
    
    private serviceName = "Projects";
    private oldTypeService = false;
    
	constructor(public http:Http, private httpMgr:HttpManager) {}

    listProjects() {
        console.log("[ProjectServices] listProjects");
        var params = {
				"consumer" : "SYSTEM"
		};
        return this.httpMgr.doGet(this.serviceName, "listProjects", params, this.oldTypeService);
    }
    
    disconnectFromProject(project) {
        console.log("[ProjectServices] disconnectFromProject");
        var params = {
				"consumer" : "SYSTEM",
                "projectName" : project
		};
        return this.httpMgr.doGet(this.serviceName, "disconnectFromProject", params, this.oldTypeService);
	}
	
	accessProject(project) {
        console.log("[ProjectServices] accessProject");
		var params = {
				"consumer" : "SYSTEM",
				"projectName" : project,
				"requestedAccessLevel" : "RW",
				"requestedLockLevel" : "NO"
		};
        return this.httpMgr.doGet(this.serviceName, "accessProject", params, this.oldTypeService);
	}
    
}