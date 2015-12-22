import {Injectable} from 'angular2/core';
import {Http, HTTP_PROVIDERS} from 'angular2/http';
import 'rxjs/add/operator/map'; //CHECK IF THIS STILL BE NEEDED IN FUTURE VERSION

import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class ProjectServices {
    
    private serviceName = "Projects";
    
	constructor(public http:Http, private httpMgr:HttpManager) {
        
	}

    listProjects() {
        console.log("[ProjectServices] listProjects");
        var params = {
				"consumer" : "SYSTEM"
		};
        return this.httpMgr.doGet(this.serviceName, "listProjects", params, false);
    }
    
}