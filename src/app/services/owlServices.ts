import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {VBEventHandler} from "../utils/VBEventHandler";
import {ARTResource, ARTURIResource, ARTNode, ARTBNode, ResAttribute} from "../models/ARTResources";

@Injectable()
export class OwlServices {

    private serviceName = "cls";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }


    /**
     * Adds a superClass to a class
     * Emits subClassCreatedEvent containing the subClass and the superClass
     * @param cls the class to which add the superClass
     * @param superClass class to add as superClass
     */
    addSuperCls(cls: ARTURIResource, superClass: ARTURIResource) {
        console.log("[owlServices] addSuperCls");
        var params: any = {
            clsqname: cls.getURI(),
            superclsqname: superClass.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "addSuperCls", params, this.oldTypeService).map(
            stResp => {
                var subClass = Deserializer.createURI(stResp.getElementsByTagName("Class")[0]);
                subClass.setAdditionalProperty(ResAttribute.CHILDREN, []);
                subClass.setAdditionalProperty(ResAttribute.MORE, cls.getAdditionalProperty(ResAttribute.MORE));
                this.eventHandler.superClassAddedEvent.emit({subClass: subClass, superClass: superClass});
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
    removeSuperCls(cls: ARTURIResource, superClass: ARTURIResource) {
        console.log("[owlServices] removeSuperCls");
        var params: any = {
            clsqname: cls.getURI(),
            superclsqname: superClass.getNominalValue(),
        };
        return this.httpMgr.doGet(this.serviceName, "removeSuperCls", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.superClassRemovedEvent.emit({cls: superClass, subClass: cls});
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