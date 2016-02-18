import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {VBEventHandler} from "../utils/VBEventHandler";

@Injectable()
export class OwlServices {

    private serviceName = "cls";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager, private deserializer: Deserializer, private eventHandler: VBEventHandler) { }

    getClassesInfoAsRootsForTree(clsName: string) {
        console.log("[owlServices] getClassesInfoAsRootsForTree");
        var params: any = {
            clsesqnames: clsName,
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
    getSubClasses(clsName: string) {
        console.log("[owlServices] getSubClasses");
        var params: any = {
            clsName: clsName,
            tree: true,
            instNum: true
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

    createClass(superClassName: string, newClassName: string) {
        console.log("[owlServices] createClass");
        var params: any = {
            superClassName: superClassName,
            newClassName: newClassName,
        };
        return this.httpMgr.doGet(this.serviceName, "createClass", params, this.oldTypeService).map(
            stResp => {
                var newClass = this.deserializer.createURI(stResp.getElementsByTagName("Class")[0]);
                newClass.setAdditionalProperty("children", []);
                this.eventHandler.subClassCreatedEvent.emit({"subClass": newClass, "superClassURI": superClassName});
                return stResp;
            }
        );
    }

    removeClass(className: string) {
        console.log("[owlServices] deleteClass");
        var params: any = {
            name: className,
            type: "Class",
        };
        return this.httpMgr.doGet("delete", "removeClass", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.classDeletedEvent.emit(className);
                return stResp;
            }
        );
    }
    
    addSuperCls(clsqname: string, superclsqname: string) {
        console.log("[owlServices] deleteClass");
        var params: any = {
            clsqname: clsqname,
            superclsqname: superclsqname,
        };
        return this.httpMgr.doGet(this.serviceName, "addSuperCls", params, this.oldTypeService);
    }
    
    removeSuperCls(clsqname: string, superclsqname: string) {
        console.log("[owlServices] removeSuperCls");
        var params: any = {
            clsqname: clsqname,
            superclsqname: superclsqname,
        };
        return this.httpMgr.doGet(this.serviceName, "removeSuperCls", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.subClassRemovedEvent.emit({classURI: superclsqname, subClassURI: clsqname});
                return stResp;
            }
        );
    }
    
    addType(clsqname: string, typeqname: string) {
        console.log("[owlServices] addType");
        var params: any = {
            clsqname: clsqname,
            typeqname: typeqname,
        };
        return this.httpMgr.doGet(this.serviceName, "addType", params, this.oldTypeService);
    }

    removeType(cls: string, type: string) {
        console.log("[owlServices] removeType");
        var params: any = {
            clsqname: cls,
            typeqname: type,
        };
        return this.httpMgr.doGet(this.serviceName, "removeType", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.typeDeletedEvent.emit({classURI: cls, typeURI: type});
                return stResp;      
            }
        );
    }
    
    addIndividual(clsName: string, instanceName: string) {
        console.log("[owlServices] addIndividual");
        var params: any = {
            clsName: clsName,
            instanceName: instanceName,
        };
        return this.httpMgr.doGet(this.serviceName, "addIndividual", params, this.oldTypeService);
    }
    
    addIntersectionOf(clsName: string, clsDescriptions: string[]) {
        console.log("[owlServices] addIntersectionOf");
        var params: any = {
            clsName: clsName,
            collectionNode: clsDescriptions.join("|_|"),
        };
        return this.httpMgr.doGet(this.serviceName, "addIntersectionOf", params, this.oldTypeService);
    }
    
    removeIntersectionOf(clsName: string, collectionNode: string) {
        console.log("[owlServices] removeIntersectionOf");
        var params: any = {
            clsName: clsName,
            collectionNode: collectionNode,
        };
        return this.httpMgr.doGet(this.serviceName, "removeIntersectionOf", params, this.oldTypeService);
    }
    
    addOneOf(clsName: string, individuals: string[]) {
        console.log("[owlServices] addOneOf");
        var params: any = {
            clsName: clsName,
            individuals: individuals.join("|_|"),
        };
        return this.httpMgr.doGet(this.serviceName, "addOneOf", params, this.oldTypeService);
    }

    removeOneOf(clsName: string, collectionNode: string) {
        console.log("[owlServices] removeOneOf");
        var params: any = {
            clsName: clsName,
            individuals: collectionNode,
        };
        return this.httpMgr.doGet(this.serviceName, "removeOneOf", params, this.oldTypeService);
    }
    
    addUnionOf(clsName: string, clsDescriptions: string[]) {
        console.log("[owlServices] addUnionOf");
        var params: any = {
            clsName: clsName,
            individuals: clsDescriptions.join("|_|"),
        };
        return this.httpMgr.doGet(this.serviceName, "addUnionOf", params, this.oldTypeService);
    }

    removeUnionOf(clsName: string, collectionNode: string) {
        console.log("[owlServices] removeUnionOf");
        var params: any = {
            clsName: clsName,
            individuals: collectionNode,
        };
        return this.httpMgr.doGet(this.serviceName, "removeUnionOf", params, this.oldTypeService);
    }

}