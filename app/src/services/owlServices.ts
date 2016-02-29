import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {VBEventHandler} from "../utils/VBEventHandler";
import {ARTResource, ARTURIResource, ARTNode} from "../utils/ARTResources";

@Injectable()
export class OwlServices {

    private serviceName = "cls";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager, private deserializer: Deserializer, private eventHandler: VBEventHandler) { }

    getClassesInfoAsRootsForTree(cls: ARTURIResource) {
        console.log("[owlServices] getClassesInfoAsRootsForTree");
        var params: any = {
            clsesqnames: cls.getURI(),
            instNum: true
        };
        return this.httpMgr.doGet(this.serviceName, "getClassesInfoAsRootsForTree", params, this.oldTypeService).map(
            stResp => {
                var roots = this.deserializer.createURIArray(stResp);
                for (var i = 0; i < roots.length; i++) {
                    roots[i].setAdditionalProperty("children", []);
                }
                return roots;
            }
        );
    }
	
	/**
	 * tree: boolean that indicates if the response should contains info about tree structure
	 * instNum: boolean that indicates if the response should contains for each classes the number of instances
	 */
    getSubClasses(cls: ARTURIResource, tree: boolean, instNum: boolean) {
        console.log("[owlServices] getSubClasses");
        var params: any = {
            clsName: cls.getURI(),
            tree: tree,
            instNum: instNum
        };
        return this.httpMgr.doGet(this.serviceName, "getSubClasses", params, this.oldTypeService).map(
            stResp => {
                var subClasses = this.deserializer.createURIArray(stResp);
                for (var i = 0; i < subClasses.length; i++) {
                    subClasses[i].setAdditionalProperty("children", []);
                }
                return subClasses;
            }
        );
    }
    
    getClassAndInstancesInfo(cls: ARTURIResource) {
        console.log("[owlServices] getClassAndInstancesInfo");
        var params: any = {
            clsName: cls.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "getClassAndInstancesInfo", params, this.oldTypeService).map(
            stResp => {
                var instancesElem = stResp.getElementsByTagName("Instances")[0];
                return this.deserializer.createURIArray(instancesElem);
            }
        );
    }

    createClass(superClass: ARTURIResource, newClassName: string) {
        console.log("[owlServices] createClass");
        var params: any = {
            superClassName: superClass.getURI(),
            newClassName: newClassName,
        };
        return this.httpMgr.doGet(this.serviceName, "createClass", params, this.oldTypeService).map(
            stResp => {
                var newClass = this.deserializer.createURI(stResp.getElementsByTagName("Class")[0]);
                newClass.setAdditionalProperty("children", []);
                this.eventHandler.subClassCreatedEvent.emit({"subClass": newClass, "superClass": superClass});
                return stResp;
            }
        );
    }

    removeClass(cls: ARTURIResource) {
        console.log("[owlServices] deleteClass");
        var params: any = {
            name: cls.getURI(),
            type: "Class",
        };
        return this.httpMgr.doGet("delete", "removeClass", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.classDeletedEvent.emit(cls);
                return stResp;
            }
        );
    }
    
    addSuperCls(cls: ARTURIResource, superClass: ARTURIResource) {
        console.log("[owlServices] deleteClass");
        var params: any = {
            clsqname: cls.getURI(),
            superclsqname: superClass.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "addSuperCls", params, this.oldTypeService);
    }
    
    removeSuperCls(cls: ARTURIResource, superClass: ARTURIResource) {
        console.log("[owlServices] removeSuperCls");
        var params: any = {
            clsqname: cls.getURI(),
            superclsqname: superClass.getNominalValue(),
        };
        return this.httpMgr.doGet(this.serviceName, "removeSuperCls", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.subClassRemovedEvent.emit({cls: superClass, subClass: cls});
                return stResp;
            }
        );
    }
    
    createInstance(cls: ARTURIResource, instanceName: string) {
        console.log("[owlServices] createInstance");
        var params: any = {
            clsName: cls.getURI(),
            instanceName: instanceName,
        };
        return this.httpMgr.doGet(this.serviceName, "createInstance", params, this.oldTypeService).map(
            stResp => {
                var instance = this.deserializer.createURI(stResp.getElementsByTagName("Instance")[0]);
                this.eventHandler.instanceCreatedEvent.emit({cls: cls, instance: instance});
                return stResp;
            }
        );
    }
    
    /**
     * parameter cls is not necessary for the request, it is simply useful for the event
     */
    removeInstance(instance: ARTURIResource, cls?: ARTURIResource) {
        console.log("[owlServices] removeInstance");
        var params: any = {
            name: instance.getURI(),
            type: "Instance",
        };
        return this.httpMgr.doGet("delete", "removeInstance", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.instanceDeletedEvent.emit({instance: instance, cls: cls});
                return stResp;
            }
        );
    }
    
    // addType(cls: ARTURIResource, type: ARTURIResource) {
    //     console.log("[owlServices] addType");
    //     var params: any = {
    //         clsqname: cls.getURI(),
    //         typeqname: type.getURI(),
    //     };
    //     return this.httpMgr.doGet(this.serviceName, "addType", params, this.oldTypeService);
    // }

    removeType(resource: ARTURIResource, type: ARTURIResource) {
        console.log("[owlServices] removeType");
        var params: any = {
            indqname: resource.getURI(),
            typeqname: type.getURI(),
        };
        return this.httpMgr.doGet("individual", "removeType", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.typeDeletedEvent.emit({resource: resource, type: type});
                return stResp;      
            }
        );
    }
    
    // addIntersectionOf(clsName: string, clsDescriptions: string[]) {
    //     console.log("[owlServices] addIntersectionOf");
    //     var params: any = {
    //         clsName: clsName,
    //         collectionNode: clsDescriptions.join("|_|"),
    //     };
    //     return this.httpMgr.doGet(this.serviceName, "addIntersectionOf", params, this.oldTypeService);
    // }
    
    removeIntersectionOf(cls: ARTURIResource, collectionNode: ARTNode) {
        console.log("[owlServices] removeIntersectionOf");
        var params: any = {
            clsName: cls.getURI(),
            collectionNode: collectionNode.getNominalValue(),
        };
        return this.httpMgr.doGet(this.serviceName, "removeIntersectionOf", params, this.oldTypeService);
    }
    
    // addOneOf(clsName: string, individuals: string[]) {
    //     console.log("[owlServices] addOneOf");
    //     var params: any = {
    //         clsName: clsName,
    //         individuals: individuals.join("|_|"),
    //     };
    //     return this.httpMgr.doGet(this.serviceName, "addOneOf", params, this.oldTypeService);
    // }

    removeOneOf(cls: ARTURIResource, collectionNode: ARTNode) {
        console.log("[owlServices] removeOneOf");
        var params: any = {
            clsName: cls.getURI(),
            individuals: collectionNode.getNominalValue(),
        };
        return this.httpMgr.doGet(this.serviceName, "removeOneOf", params, this.oldTypeService);
    }
    
    // addUnionOf(clsName: string, clsDescriptions: string[]) {
    //     console.log("[owlServices] addUnionOf");
    //     var params: any = {
    //         clsName: clsName,
    //         individuals: clsDescriptions.join("|_|"),
    //     };
    //     return this.httpMgr.doGet(this.serviceName, "addUnionOf", params, this.oldTypeService);
    // }

    removeUnionOf(cls: ARTURIResource, collectionNode: ARTNode) {
        console.log("[owlServices] removeUnionOf");
        var params: any = {
            clsName: cls.getURI(),
            individuals: collectionNode.getNominalValue(),
        };
        return this.httpMgr.doGet(this.serviceName, "removeUnionOf", params, this.oldTypeService);
    }

}