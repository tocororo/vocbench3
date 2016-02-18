import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";
import {VBEventHandler} from "../utils/VBEventHandler";
import {Deserializer} from "../utils/Deserializer";
import {ARTURIResource} from "../utils/ARTResources";

@Injectable()
export class PropertyServices {

    private serviceName = "property";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler, private deserializer: Deserializer) { }

    getPropertiesTree(instanceQName?: string, method?: string) {
        console.log("[PropertyServices] getPropertiesTree");
        var params: any = {}
        if (instanceQName != undefined) {
            params.instanceQName = instanceQName;
            params.method = method;
        }
        return this.httpMgr.doGet(this.serviceName, "getPropertiesTree", params, this.oldTypeService).map(
            stResp => {
                var propertyTree: ARTURIResource[] = new Array()
                var propertiesXml = stResp.querySelectorAll("data > Property");
                for (var i = 0; i < propertiesXml.length; i++) {
                    var p = this.parseProperty(propertiesXml[i]);
                    propertyTree.push(p);
                }
                return propertyTree;
            }
        );
    }
    
    //when property service will be reimplemented with <uri> element this will be not useful anymore
    private parseProperty(propXml): ARTURIResource {
        var show = propXml.getAttribute("name");
        var role = propXml.getAttribute("type");
        var uri = propXml.getAttribute("uri");
        var deleteForbidden = propXml.getAttribute("deleteForbidden") == "true";
        var p = new ARTURIResource(uri, show, role);
        p.setAdditionalProperty("deleteForbidden", deleteForbidden);
        //recursively parse children
        var subProperties: ARTURIResource[] = [];
        var subPropsXml = propXml.querySelectorAll(":scope > SubProperties > Property");
        for (var i=0; i<subPropsXml.length; i++) {
            var subP = this.parseProperty(subPropsXml[i]);
            subProperties.push(subP);
        }
        p.setAdditionalProperty("children", subProperties);
        return p;
    }

    removeProperty(name: string) {
        console.log("[PropertyServices] removeProperty");
        var params: any = {
            name: name,
            type: "Property",
        };
        return this.httpMgr.doGet("delete", "removeProperty", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.propertyDeletedEvent.emit(name);
                return stResp;
            }
        );
    }

    addProperty(propertyQName: string, propertyType: string) {
        console.log("[PropertyServices] addProperty");
        var params: any = {
            propertyQName: propertyQName,
            propertyType: propertyType,
        };
        return this.httpMgr.doGet(this.serviceName, "addProperty", params, this.oldTypeService).map(
            stResp => {
                var newProp = this.deserializer.createURI(stResp);
                newProp.setAdditionalProperty("children", []);
                this.eventHandler.topPropertyCreatedEvent.emit(newProp);
                return newProp;
            }
        );
    }

    addSubProperty(propertyQName: string, propertyType: string, superPropertyQName: string) {
        console.log("[PropertyServices] addSubProperty");
        var params: any = {
            propertyQName: propertyQName,
            propertyType: propertyType,
            superPropertyQName: superPropertyQName,
        };
        return this.httpMgr.doGet(this.serviceName, "addProperty", params, this.oldTypeService).map(
            stResp => {
                var newProp = this.deserializer.createURI(stResp);
                newProp.setAdditionalProperty("children", []);
                this.eventHandler.subPropertyCreatedEvent.emit({"subProperty": newProp, "superPropertyURI": superPropertyQName});
                return newProp;
            }
        );
    }

    removePropValue(instanceQName: string, propertyQName: string, value: string, rangeQName: string, type: string, lang?: string) {
        console.log("[PropertyServices] removePropValue");
        var params: any = {
            instanceQName: instanceQName,
            propertyQName: propertyQName,
            value: value,
            rangeQName: rangeQName,
            type: type,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "removePropValue", params, this.oldTypeService);
    }

    createAndAddPropValue(instanceQName: string, propertyQName: string, value: string, rangeQName: string, type: string, lang?: string) {
        console.log("[PropertyServices] createAndAddPropValue");
        var params: any = {
            instanceQName: instanceQName,
            propertyQName: propertyQName,
            value: value,
            rangeQName: rangeQName,
            type: type,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "createAndAddPropValue", params, this.oldTypeService);
    }

    addExistingPropValue(instanceQName: string, propertyQName: string, value: string, type: string) {
        console.log("[PropertyServices] addExistingPropValue");
        var params: any = {
            instanceQName: instanceQName,
            propertyQName: propertyQName,
            value: value,
            type: type,
        };
        return this.httpMgr.doGet(this.serviceName, "addExistingPropValue", params, this.oldTypeService);
    }

    addSuperProperty(propertyQName: string, superPropertyQName: string) {
        console.log("[PropertyServices] addSuperProperty");
        var params: any = {
            propertyQName: propertyQName,
            superPropertyQName: superPropertyQName,
        };
        return this.httpMgr.doGet(this.serviceName, "addSuperProperty", params, this.oldTypeService);
    }

    removeSuperProperty(propertyQName: string, superPropertyQName: string) {
        console.log("[PropertyServices] removeSuperProperty");
        var params: any = {
            propertyQName: propertyQName,
            superPropertyQName: superPropertyQName,
        };
        return this.httpMgr.doGet(this.serviceName, "removeSuperProperty", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.superPropertyRemovedEvent.emit({propertyURI: propertyQName, superPropertyURI: superPropertyQName});
                return stResp;
            }
        );
    }

    removePropertyDomain(propertyQName: string, domainPropertyQName: string) {
        console.log("[PropertyServices] removePropertyDomain");
        var params: any = {
            propertyQName: propertyQName,
            domainPropertyQName: domainPropertyQName,
        };
        return this.httpMgr.doGet(this.serviceName, "removePropertyDomain", params, this.oldTypeService);
    }

    removePropertyRange(propertyQName: string, rangePropertyQName: string) {
        console.log("[PropertyServices] removePropertyRange");
        var params: any = {
            propertyQName: propertyQName,
            rangePropertyQName: rangePropertyQName,
        };
        return this.httpMgr.doGet(this.serviceName, "removePropertyRange", params, this.oldTypeService);
    }
    
}