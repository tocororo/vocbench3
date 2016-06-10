import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {VBEventHandler} from "../utils/VBEventHandler";
import {ARTResource, ARTURIResource, ARTNode, ARTBNode, ResAttribute} from "../utils/ARTResources";

@Injectable()
export class OwlServices {

    private serviceName = "cls";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    /**
     * @param cls root class of the tree
     * @return roots an array of root classes 
     */
    getClassesInfoAsRootsForTree(cls: ARTURIResource) {
        console.log("[owlServices] getClassesInfoAsRootsForTree");
        var params: any = {
            clsesqnames: cls.getURI(),
            instNum: true
        };
        return this.httpMgr.doGet(this.serviceName, "getClassesInfoAsRootsForTree", params, this.oldTypeService).map(
            stResp => {
                var roots = Deserializer.createURIArray(stResp);
                for (var i = 0; i < roots.length; i++) {
                    roots[i].setAdditionalProperty(ResAttribute.CHILDREN, []);
                }
                return roots;
            }
        );
    }
	
	/**
     * Returns a list of ARTURIResource subClasses of the given class
     * @param cls class of which retrieve its subClasses
	 * @param tree boolean that indicates if the response should contains info about tree structure
	 * @param instNum boolean that indicates if the response should contains for each classes the number of instances
     * @return subClasses an array of subClasses
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
                var subClasses = Deserializer.createURIArray(stResp);
                for (var i = 0; i < subClasses.length; i++) {
                    subClasses[i].setAdditionalProperty(ResAttribute.CHILDREN, []);
                }
                return subClasses;
            }
        );
    }
    
    /**
     * Returns a list of ARTURIResource instances of the given class
     * @param cls class of which retrieve its instances
     * @return an array of instances
     */
    getClassAndInstancesInfo(cls: ARTURIResource) {
        console.log("[owlServices] getClassAndInstancesInfo");
        var params: any = {
            clsName: cls.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "getClassAndInstancesInfo", params, this.oldTypeService).map(
            stResp => {
                var instancesElem = stResp.getElementsByTagName("Instances")[0];
                return Deserializer.createURIArray(instancesElem);
            }
        );
    }

    /**
     * Creates a class (subClass of the given superClass) with the given name.
     * Emits subClassCreatedEvent containing the subClass and the superClass
     * @param superClass the superClass of the new created class
     * @param newClassName local name of the new class
     */
    createClass(superClass: ARTURIResource, newClassName: string) {
        console.log("[owlServices] createClass");
        var params: any = {
            superClassName: superClass.getURI(),
            newClassName: newClassName,
        };
        return this.httpMgr.doGet(this.serviceName, "createClass", params, this.oldTypeService).map(
            stResp => {
                var newClass = Deserializer.createURI(stResp.getElementsByTagName("Class")[0]);
                newClass.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.subClassCreatedEvent.emit({subClass: newClass, superClass: superClass});
                return stResp;
            }
        );
    }

    /**
     * Adds a superClass to a class
     * Emits subClassCreatedEvent containing the subClass and the superClass
     * @param cls the class to which add the superClass
     * @param superClass class to add as superClass
     */
    addSuperCls(cls: ARTURIResource, superClass: ARTURIResource) {
        console.log("[owlServices] deleteClass");
        var params: any = {
            clsqname: cls.getURI(),
            superclsqname: superClass.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "addSuperCls", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.subClassCreatedEvent.emit({subClass: cls, superClass: superClass});
                return stResp;
            }
        );
    }
    
    /**
     * Removes a superClass from a class.
     * Emits a subClassRemovedEvent with cls (the superClass removed) and subClass
     * (the class to which su superClass has been removed)
     * @param cls class to which remove a superClass
     * @param superClass superClass to be removed
     */
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
    
    /**
     * Creates an instance for the given class. Emits a instanceCreatedEvent with cls (the class of the created instance)
     * and instance (the new created instance)
     * @param cls the class of the new instance
     * @param instanceName localName of the new instance
     */
    createInstance(cls: ARTURIResource, instanceName: string) {
        console.log("[owlServices] createInstance");
        var params: any = {
            clsName: cls.getURI(),
            instanceName: instanceName,
        };
        return this.httpMgr.doGet(this.serviceName, "createInstance", params, this.oldTypeService).map(
            stResp => {
                var instance = Deserializer.createURI(stResp.getElementsByTagName("Instance")[0]);
                this.eventHandler.instanceCreatedEvent.emit({cls: cls, instance: instance});
                return stResp;
            }
        );
    }
    
    /**
     * Returns a collection of direct (not inferred) types for the given instance
     * @param instance the instance whose types are requested
     * @return an array of types
     */
    getDirectNamedTypes(instance: ARTURIResource) {
        console.log("[owlServices] getDirectNamedTypes");
        var params: any = {
            indqname: instance.getURI(),
        };
        return this.httpMgr.doGet("individual", "getDirectNamedTypes", params, this.oldTypeService).map(
            stResp => {
                return Deserializer.createURIArray(stResp.getElementsByTagName("Types")[0]);
            }
        );
    }
    
    /**
     * Adds a type to a resource. Emits a typeDeletedEvent with resource and type
     * @param resource the resource to which add a type
     * @param type the type to add to the individual
     */
    addType(resource: ARTURIResource, type: ARTURIResource) {
        console.log("[owlServices] addType");
        var params: any = {
            indqname: resource.getURI(),
            typeqname: type.getURI(),
        };
        return this.httpMgr.doGet("individual", "addType", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.typeAddedEvent.emit({resource: resource, type: type});
                return stResp;
            }
        );
    }

    /**
     * Removes the type of a resource. Emits a typeDeletedEvent with resource (the resource to which the type is removed)
     * and type (the removed type)
     * @param resource the resource whose the type need to be removed
     * @param type type to remove 
     */
    removeType(resource: ARTURIResource, type: ARTURIResource) {
        console.log("[owlServices] removeType");
        var params: any = {
            indqname: resource.getURI(),
            typeqname: type.getURI(),
        };
        return this.httpMgr.doGet("individual", "removeType", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.typeRemovedEvent.emit({resource: resource, type: type});
                return stResp;      
            }
        );
    }
    
    /**
     * Adds a collection of class as intersectionOf a class.
     * @param cls the resource whose the enriching the intersectionOf
     * @param collectionNode collection of ARTResource that contains classes (ARTResource) or expression (ARTBNode)
     */
    addIntersectionOf(cls: ARTURIResource, collectionNode: ARTResource[]) {
        console.log("[owlServices] addIntersectionOf");
        var collNodeArray = new Array<string>();
        for (var i=0; i<collectionNode.length; i++) {
            if (collectionNode[i] instanceof ARTBNode) {
                //getShow because getNominalValue returns "_:"+id and in this case, since the ARTBNode is
                //created manually, the id is the expression (something like :A and :B) so the nominal value
                //will be invalid (_::A and :B) 
                collNodeArray.push(collectionNode[i].getShow());
            } else if (collectionNode[i] instanceof ARTURIResource) {
                collNodeArray.push("<"+collectionNode[i].getNominalValue()+">");
            }
        }
        var params: any = {
            clsName: cls.getURI(),
            clsDescriptions: collNodeArray.join("|_|"),
        };
        return this.httpMgr.doGet(this.serviceName, "addIntersectionOf", params, this.oldTypeService);
    }
    
    /**
     * Removes an intersectionOf class axiom
     * @param cls class to which remove the intersectionOf axiom
     * @param collectionNode the node representing the intersectionOf expression
     */
    removeIntersectionOf(cls: ARTURIResource, collectionNode: ARTNode) {
        console.log("[owlServices] removeIntersectionOf");
        var params: any = {
            clsName: cls.getURI(),
            collectionNode: collectionNode.getNominalValue(),
        };
        return this.httpMgr.doGet(this.serviceName, "removeIntersectionOf", params, this.oldTypeService);
    }
    
    /**
     * Adds a collection of class as unionOf a class.
     * @param cls the resource whose the enriching the unionOf
     * @param collectionNode collection of ARTResource that contains classes (ARTResource) or expression (ARTBNode)
     */
    addUnionOf(cls: ARTURIResource, collectionNode: ARTResource[]) {
        console.log("[owlServices] addUnionOf");
        var collNodeArray = new Array<string>();
        for (var i=0; i<collectionNode.length; i++) {
            if (collectionNode[i] instanceof ARTBNode) {
                //getShow because getNominalValue returns "_:"+id and in this case, since the ARTBNode is
                //created manually, the id is the expression (something like :A and :B) so the nominal value
                //will be invalid (_::A and :B) 
                collNodeArray.push(collectionNode[i].getShow());
            } else if (collectionNode[i] instanceof ARTURIResource) {
                collNodeArray.push("<"+collectionNode[i].getNominalValue()+">");
            }
        }
        var params: any = {
            clsName: cls.getURI(),
            clsDescriptions: collNodeArray.join("|_|"),
        };
        return this.httpMgr.doGet(this.serviceName, "addUnionOf", params, this.oldTypeService);
    }

    /**
     * Removes an unionOf class axiom
     * @param cls class to which remove the unionOf axiom
     * @param collectionNode the node representing the unionOf expression
     */
    removeUnionOf(cls: ARTURIResource, collectionNode: ARTNode) {
        console.log("[owlServices] removeUnionOf");
        var params: any = {
            clsName: cls.getURI(),
            individuals: collectionNode.getNominalValue(),
        };
        return this.httpMgr.doGet(this.serviceName, "removeUnionOf", params, this.oldTypeService);
    }
    
    /**
     * Adds a collection of instances as oneOf a class.
     * @param cls the resource whose the enriching the unionOf
     * @param collectionNode collection of ARTResource that contains classes (ARTResource) or expression (ARTBNode)
     */
    addOneOf(cls: ARTURIResource, individuals: ARTURIResource[]) {
        console.log("[owlServices] addOneOf");
        var collIndividualArray = new Array<string>();
        for (var i=0; i<individuals.length; i++) {
            collIndividualArray.push(individuals[i].getURI());
        }
        var params: any = {
            clsName: cls.getURI(),
            individuals: collIndividualArray.join("|_|"),
        };
        return this.httpMgr.doGet(this.serviceName, "addOneOf", params, this.oldTypeService);
    }

    /**
     * Removes an oneOf class axiom
     * @param cls class to which remove the oneOf axiom
     * @param collectionNode the node representing the oneOf expression
     */
    removeOneOf(cls: ARTURIResource, collectionNode: ARTNode) {
        console.log("[owlServices] removeOneOf");
        var params: any = {
            clsName: cls.getURI(),
            collectionNode: collectionNode.getNominalValue(),
        };
        return this.httpMgr.doGet(this.serviceName, "removeOneOf", params, this.oldTypeService);
    }
    
}