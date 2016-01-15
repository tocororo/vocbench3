import {Injectable} from 'angular2/core';
import {Http} from 'angular2/http';
import 'rxjs/add/operator/map'; //CHECK IF THIS STILL BE NEEDED IN FUTURE VERSION

import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class ResourceViewServices {
    
    private serviceName = "ResourceView";
    private oldTypeService = false;
    
	constructor(public http:Http, private httpMgr:HttpManager) {}
    
	getResourceView(resource:string) {
		console.log("[resourceViewServices] getResourceView");
		var params:any = {
				"resource" : resource,
		};
		return this.httpMgr.doGet(this.serviceName, "getResourceView", params, this.oldTypeService);
	}	
	
}