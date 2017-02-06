import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {ARTResource, ARTURIResource, ResAttribute} from "../utils/ARTResources";

@Injectable()
export class ClassesServices {

    private serviceName = "Classes";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * takes a list of classes and return their description as if they were roots for a tree
	 * (so more, role, explicit etc...)
     * @param classList
     */
    getClassesInfo(classList: ARTURIResource[]): Observable<ARTURIResource[]> {
        console.log("[ClassesServices] getClassesInfo");
        var params: any = {
            classList: classList
        };
        return this.httpMgr.doGet(this.serviceName, "getClassesInfo", params, this.oldTypeService, true).map(
            stResp => {
                var classes = Deserializer.createResourceArray(stResp);
                for (var i = 0; i < classes.length; i++) {
                    classes[i].setAdditionalProperty(ResAttribute.CHILDREN, []);
                }
                return classes;
            }
        );
    }
    
    /**
     * Returns a list of ARTURIResource subClasses of the given class
     * @param superClass class of which retrieve its subClasses
	 */
    getSubClasses(superClass: ARTURIResource): Observable<ARTURIResource[]> {
        console.log("[ClassesServices] getSubClasses");
        var params: any = {
            superClass: superClass
        };
        return this.httpMgr.doGet(this.serviceName, "getSubClasses", params, this.oldTypeService, true).map(
            stResp => {
                var subClasses = Deserializer.createResourceArray(stResp);
                for (var i = 0; i < subClasses.length; i++) {
                    subClasses[i].setAdditionalProperty(ResAttribute.CHILDREN, []);
                }
                return subClasses;
            }
        );
    }

    /**
     * Returns the (explicit) instances of the class cls.
	 * @param cls
     */
    getInstances(cls: ARTURIResource): Observable<ARTURIResource[]> {
        console.log("[ClassesServices] getInstances");
        var params: any = {
            cls: cls
        };
        return this.httpMgr.doGet(this.serviceName, "getInstances", params, this.oldTypeService, true).map(
            stResp => {
                var instances = Deserializer.createResourceArray(stResp);
                return instances;
            }
        );
    }

    
}