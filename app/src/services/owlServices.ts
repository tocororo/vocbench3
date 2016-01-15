import {Injectable} from 'angular2/core';
import {Http} from 'angular2/http';
import 'rxjs/add/operator/map'; //CHECK IF THIS STILL BE NEEDED IN FUTURE VERSION

import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class OwlServices {
    
    private serviceName = "cls";
    private oldTypeService = true;
    
	constructor(public http:Http, private httpMgr:HttpManager) {}
    
    getClassesInfoAsRootsForTree(clsName:string) {
		console.log("[owlServices] getClassesInfoAsRootsForTree");
		var params:any = {
				"clsesqnames" : clsName,
				"instNum" : true
		};
		return this.httpMgr.doGet(this.serviceName, "getClassesInfoAsRootsForTree", params, this.oldTypeService);
	}
	
	/**
	 * tree: boolean that indicates if the response should contains info about tree structure
	 * instNum: boolean that indicates if the response should contains for each classes the number of instances
	 */
	getSubClasses(clsName:string) {
		console.log("[owlServices] getSubClasses");
		var params:any = {
				"clsName" : clsName,
				"tree" : true,
				"instNum" : true
		};
		return this.httpMgr.doGet(this.serviceName, "getSubClasses", params, this.oldTypeService);
	}
	
	createClass(superClassName:string, newClassName:string) {
		console.log("[owlServices] createClass");
		var params:any = {
				"superClassName" : superClassName,
				"newClassName" : newClassName,
		};
		return this.httpMgr.doGet(this.serviceName, "createClass", params, this.oldTypeService);
	}
	
	deleteClass(className:string) {
		console.log("[owlServices] deleteClass");
		var params:any = {
				"name" : className,
				"type" : "Class",
		};
		return this.httpMgr.doGet("delete", "removeClass", params, this.oldTypeService);
	}
    
}