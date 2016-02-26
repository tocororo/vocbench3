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

    //check parameters, maybe they're useless
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
        //properties use deleteForbidden instead of explicit, use explicit in order to standardize the attributes
        var explicit = propXml.getAttribute("deleteForbidden") != "true";
        var p = new ARTURIResource(uri, show, role);
        p.setAdditionalProperty("explicit", explicit);
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

    removeProperty(property: ARTURIResource) {
        console.log("[PropertyServices] removeProperty");
        var params: any = {
            name: property.getURI(),
            type: "Property",
        };
        return this.httpMgr.doGet("delete", "removeProperty", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.propertyDeletedEvent.emit(property);
                return property;
            }
        );
    }

    addProperty(propertyName: string, propertyType: string) {
        console.log("[PropertyServices] addProperty");
        var params: any = {
            propertyQName: propertyName,
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

    addSubProperty(propertyQName: string, superProperty: ARTURIResource) {
        console.log("[PropertyServices] addSubProperty");
        var params: any = {
            propertyQName: propertyQName,
            propertyType: superProperty.getRole(),
            superPropertyQName: superProperty.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "addProperty", params, this.oldTypeService).map(
            stResp => {
                var newProp = this.deserializer.createURI(stResp.getElementsByTagName("Property")[0]);
                newProp.setAdditionalProperty("children", []);
                this.eventHandler.subPropertyCreatedEvent.emit({"subProperty": newProp, "superProperty": superProperty});
                return newProp;
            }
        );
    }

    removePropValue(subject: ARTURIResource, property: ARTURIResource, value: string, rangeQName: string, type: string, lang?: string) {
        console.log("[PropertyServices] removePropValue");
        var params: any = {
            instanceQName: subject.getURI(),
            propertyQName: property.getURI(),
            value: value,
            rangeQName: rangeQName,
            type: type,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "removePropValue", params, this.oldTypeService);
    }

    createAndAddPropValue(subject: ARTURIResource, property: ARTURIResource, value: string, rangeQName: string, type: string, lang?: string) {
        console.log("[PropertyServices] createAndAddPropValue");
        var params: any = {
            instanceQName: subject.getURI(),
            propertyQName: property.getURI(),
            value: value,
            rangeQName: rangeQName,
            type: type,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "createAndAddPropValue", params, this.oldTypeService);
    }

    addExistingPropValue(subject: ARTURIResource, property: ARTURIResource, value: string, type: string) {
        console.log("[PropertyServices] addExistingPropValue");
        var params: any = {
            instanceQName: subject.getURI(),
            propertyQName: property.getURI(),
            value: value,
            type: type,
        };
        return this.httpMgr.doGet(this.serviceName, "addExistingPropValue", params, this.oldTypeService);
    }

    addSuperProperty(property: ARTURIResource, superProperty: ARTURIResource) {
        console.log("[PropertyServices] addSuperProperty");
        var params: any = {
            propertyQName: property.getURI(),
            superPropertyQName: superProperty.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "addSuperProperty", params, this.oldTypeService);
    }

    removeSuperProperty(property: ARTURIResource, superProperty: ARTURIResource) {
        console.log("[PropertyServices] removeSuperProperty");
        var params: any = {
            propertyQName: property.getURI(),
            superPropertyQName: superProperty.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "removeSuperProperty", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.superPropertyRemovedEvent.emit({property: property, superProperty: superProperty});
                return stResp;
            }
        );
    }

    removePropertyDomain(property: ARTURIResource, domainProperty: ARTURIResource) {
        console.log("[PropertyServices] removePropertyDomain");
        var params: any = {
            propertyQName: property.getURI(),
            domainPropertyQName: domainProperty.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "removePropertyDomain", params, this.oldTypeService);
    }

    removePropertyRange(property: ARTURIResource, rangeProperty: ARTURIResource) {
        console.log("[PropertyServices] removePropertyRange");
        var params: any = {
            propertyQName: property.getURI(),
            rangePropertyQName: rangeProperty.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "removePropertyRange", params, this.oldTypeService);
    }
    
}