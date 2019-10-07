import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { VBEventHandler } from "../utils/VBEventHandler";
import { ARTResource, ARTURIResource, ARTNode, ARTBNode, ResAttribute } from "../models/ARTResources";
import { CustomFormValue } from "../models/CustomForms";
import { ResourcesServices } from "./resourcesServices"

@Injectable()
export class ClassesServices {

    private serviceName = "Classes";

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler, private resourceService: ResourcesServices) { }

    /**
     * takes a list of classes and return their description as if they were roots for a tree
	 * (so more, role, explicit etc...)
     * @param classList
     */
    getClassesInfo(classList: ARTURIResource[], options?: VBRequestOptions): Observable<ARTURIResource[]> {
        var params: any = {
            classList: classList
        };
        return this.httpMgr.doGet(this.serviceName, "getClassesInfo", params, options).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * Returns a list of ARTURIResource subClasses of the given class
     * @param superClass class of which retrieve its subClasses
	 */
    getSubClasses(superClass: ARTURIResource, numInst: boolean, options?: VBRequestOptions): Observable<ARTURIResource[]> {
        var params: any = {
            superClass: superClass,
            numInst: numInst
        };
        return this.httpMgr.doGet(this.serviceName, "getSubClasses", params, options).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * Returns the (explicit) instances of the class cls.
	 * @param cls
     */
    getInstances(cls: ARTURIResource, options?: VBRequestOptions): Observable<ARTResource[]> {
        var params: any = {
            cls: cls
        };
        return this.httpMgr.doGet(this.serviceName, "getInstances", params, options).map(
            stResp => {
                var instances = Deserializer.createResourceArray(stResp);
                return instances;
            }
        );
    }

    /**
     * 
     * @param cls 
     */
    getNumberOfInstances(cls: ARTURIResource, options?: VBRequestOptions): Observable<number> {
        var params: any = {
            cls: cls
        };
        return this.httpMgr.doGet(this.serviceName, "getNumberOfInstances", params, options);
    }

    /**
     * Creates a new class
     * @param newClass 
     * @param superClass 
     * @param classType the type of the class (rdfs:Class or owl:Class)
     * @param customFormValue custom form that set additional info to the concept
     */
    createClass(newClass: ARTURIResource, superClass: ARTURIResource, classType?: ARTURIResource, customFormValue?: CustomFormValue) {
        var params: any = {
            newClass: newClass,
            superClass: superClass
        };
        if (classType != null) {
            params.classType = classType;
        }
        if (customFormValue != null) {
            params.customFormValue = customFormValue;
        }
        return this.httpMgr.doPost(this.serviceName, "createClass", params).map(
            stResp => {
                return Deserializer.createURI(stResp);
            }
        ).flatMap(
            cls => {
                return this.resourceService.getResourceDescription(cls).map(
                    resource => {
                        resource.setAdditionalProperty(ResAttribute.NUM_INST, 0);
                        resource.setAdditionalProperty(ResAttribute.NEW, true);
                        this.eventHandler.subClassCreatedEvent.emit({ subClass: resource, superClass: superClass });
                        return resource;
                    }
                );
            }
        );
    }

    /**
     * Removes a class. Emits a classDeletedEvent with the removed class
     * @param cls 
     */
    deleteClass(cls: ARTURIResource) {
        var params: any = {
            cls: cls
        };
        return this.httpMgr.doPost(this.serviceName, "deleteClass", params).map(
            stResp => {
                this.eventHandler.classDeletedEvent.emit(cls);
                return stResp;
            }
        );
    }

    /**
     * Creates a new instance for the given class
     * @param newInstance 
     * @param cls 
     * @param customFormValue custom form that set additional info to the concept
     */
    createInstance(newInstance: ARTURIResource, cls: ARTURIResource, customFormValue?: CustomFormValue) {
        var params: any = {
            newInstance: newInstance,
            cls: cls
        };
        if (customFormValue != null) {
            params.customFormValue = customFormValue;
        }
        return this.httpMgr.doPost(this.serviceName, "createInstance", params).map(
            stResp => {
                return Deserializer.createURI(stResp);
            }
        ).flatMap(
            instance => {
                return this.resourceService.getResourceDescription(instance).map(
                    resource => {
                        resource.setAdditionalProperty(ResAttribute.NEW, true);
                        this.eventHandler.instanceCreatedEvent.emit({ cls: cls, instance: resource });
                        return resource;
                    }
                );
            }
        );
    }

    /**
     * Deletes an instance. Emits an instanceDeletedEvent with instance (the removed instance) and
     * cls (the type of the instance)
     * @param instance the instance to remove
     * @param cls the type of the instance. This parameter is not necessary for the request, but is needed for the event
     */
    deleteInstance(instance: ARTResource, cls: ARTURIResource) {
        var params: any = {
            instance: instance
        };
        return this.httpMgr.doPost(this.serviceName, "deleteInstance", params).map(
            stResp => {
                this.eventHandler.instanceDeletedEvent.emit({instance: instance, cls: cls});
                return stResp;
            }
        );
    }

    /**
     * Adds a superClass to a class
     * Emits subClassCreatedEvent containing the subClass and the superClass
     * @param cls the class to which add the superClass
     * @param supercls class to add as superClass
     */
    addSuperCls(cls: ARTURIResource, supercls: ARTURIResource) {
        var params: any = {
            cls: cls,
            supercls: supercls,
        };
        return this.httpMgr.doPost(this.serviceName, "addSuperCls", params).map(
            stResp => {
                this.eventHandler.superClassAddedEvent.emit({subClass: cls, superClass: supercls});
                return stResp;
            }
        );
    }

    /**
     * Removes a superClass from a class.
     * Emits a superClassRemovedEvent with cls (the superClass removed) and subClass
     * (the class to which su superClass has been removed)
     * @param cls class to which remove a superClass
     * @param superClass superClass to be removed
     */
    removeSuperCls(cls: ARTURIResource, supercls: ARTURIResource) {
        var params: any = {
            cls: cls,
            supercls: supercls,
        };
        return this.httpMgr.doPost(this.serviceName, "removeSuperCls", params).map(
            stResp => {
                this.eventHandler.superClassRemovedEvent.emit({superClass: supercls, subClass: cls});
                return stResp;
            }
        );
    }
    
    /**
     * Adds a collection of class as intersectionOf a class.
     * @param cls the resource whose the enriching the intersectionOf
     * @param clsDescriptions collection of ARTResource that contains classes (ARTResource) or expression (ARTBNode)
     */
    addIntersectionOf(cls: ARTURIResource, collectionNode: ARTResource[]) {
        var collNodeArray = new Array<string>();
        for (var i=0; i<collectionNode.length; i++) {
            if (collectionNode[i] instanceof ARTBNode) {
                //getShow because getNominalValue returns "_:"+id and in this case, since the ARTBNode is
                //created manually, the id is the expression (something like :A and :B) so the nominal value
                //will be invalid (_::A and :B) 
                collNodeArray.push(collectionNode[i].getShow());
            } else if (collectionNode[i] instanceof ARTURIResource) {
                collNodeArray.push(collectionNode[i].toNT());
            }
        }
        var params: any = {
            cls: cls,
            clsDescriptions: collNodeArray.join(","),
        };
        return this.httpMgr.doPost(this.serviceName, "addIntersectionOf", params);
    }
    
    /**
     * Removes an intersectionOf class axiom
     * @param cls class to which remove the intersectionOf axiom
     * @param collectionNode the node representing the intersectionOf expression
     */
    removeIntersectionOf(cls: ARTURIResource, collectionBNode: ARTNode) {
        var params: any = {
            cls: cls,
            collectionBNode: collectionBNode,
        };
        return this.httpMgr.doPost(this.serviceName, "removeIntersectionOf", params);
    }
    
    /**
     * Adds a collection of class as unionOf a class.
     * @param cls the resource whose the enriching the unionOf
     * @param collectionNode collection of ARTResource that contains classes (ARTResource) or expression (ARTBNode)
     */
    addUnionOf(cls: ARTURIResource, collectionNode: ARTResource[]) {
        var collNodeArray = new Array<string>();
        for (var i=0; i<collectionNode.length; i++) {
            if (collectionNode[i] instanceof ARTBNode) {
                //getShow because getNominalValue returns "_:"+id and in this case, since the ARTBNode is
                //created manually, the id is the expression (something like :A and :B) so the nominal value
                //will be invalid (_::A and :B) 
                collNodeArray.push(collectionNode[i].getShow());
            } else if (collectionNode[i] instanceof ARTURIResource) {
                collNodeArray.push(collectionNode[i].toNT());
            }
        }
        var params: any = {
            cls: cls,
            clsDescriptions: collNodeArray.join(","),
        };
        return this.httpMgr.doPost(this.serviceName, "addUnionOf", params);
    }

    /**
     * Removes an unionOf class axiom
     * @param cls class to which remove the unionOf axiom
     * @param collectionNode the node representing the unionOf expression
     */
    removeUnionOf(cls: ARTURIResource, collectionBNode: ARTBNode) {
        var params: any = {
            cls: cls,
            collectionBNode: collectionBNode,
        };
        return this.httpMgr.doPost(this.serviceName, "removeUnionOf", params);
    }
    
    /**
     * Adds a collection of instances as oneOf a class.
     * @param cls the resource whose the enriching the unionOf
     * @param individuals collection of individuals
     */
    addOneOf(cls: ARTURIResource, individuals: ARTURIResource[]) {
        var params: any = {
            cls: cls,
            individuals: individuals,
        };
        return this.httpMgr.doPost(this.serviceName, "addOneOf", params);
    }

    /**
     * Removes an oneOf class axiom
     * @param cls class to which remove the oneOf axiom
     * @param collectionNode the node representing the oneOf expression
     */
    removeOneOf(cls: ARTURIResource, collectionBNode: ARTBNode) {
        var params: any = {
            cls: cls,
            collectionBNode: collectionBNode,
        };
        return this.httpMgr.doPost(this.serviceName, "removeOneOf", params);
    }


}