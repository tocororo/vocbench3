import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { VBEventHandler } from "../utils/VBEventHandler";
import { ARTResource, ARTURIResource, ResAttribute } from "../models/ARTResources";

@Injectable()
export class ClassesServices {

    private serviceName = "Classes";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

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

    /**
     * Creates a new class
     * @param newClass 
     * @param superClass 
     * @param customFormId id of the custom form that set additional info to the concept
     * @param userPromptMap json map object of key - value of the custom form
     */
    createClass(newClass: ARTURIResource, superClass: ARTURIResource,
        customFormId?: string, userPromptMap?: any) {
        console.log("[ClassesServices] createClass");
        var params: any = {
            newClass: newClass,
            superClass: superClass
        };
        if (customFormId != null && userPromptMap != null) {
            params.customFormId = customFormId;
            params.userPromptMap = JSON.stringify(userPromptMap);
        }
        return this.httpMgr.doPost(this.serviceName, "createClass", params, this.oldTypeService, true).map(
            stResp => {
                var newCls = Deserializer.createURI(stResp);
                newCls.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.subClassCreatedEvent.emit({ subClass: newCls, superClass: superClass });
                return stResp;
            }
        );
    }

    /**
     * Creates a new instance for the given class
     * @param newInstance 
     * @param cls 
     * @param customFormId id of the custom form that set additional info to the concept
     * @param userPromptMap json map object of key - value of the custom form
     */
    createInstance(newInstance: ARTURIResource, cls: ARTURIResource,
        customFormId?: string, userPromptMap?: any) {
        console.log("[ClassesServices] createInstance");
        var params: any = {
            newInstance: newInstance,
            cls: cls
        };
        if (customFormId != null && userPromptMap != null) {
            params.customFormId = customFormId;
            params.userPromptMap = JSON.stringify(userPromptMap);
        }
        return this.httpMgr.doPost(this.serviceName, "createInstance", params, this.oldTypeService, true).map(
            stResp => {
                var instance = Deserializer.createURI(stResp);
                this.eventHandler.instanceCreatedEvent.emit({cls: cls, instance: instance});
                return stResp;
            }
        );
    }


}