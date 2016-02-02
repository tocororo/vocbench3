import {Injectable} from 'angular2/core';
import {Http} from 'angular2/http';
import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class PropertyServices {

    private serviceName = "property";
    private oldTypeService = true;

    constructor(public http: Http, private httpMgr: HttpManager) { }

    getPropertiesTree(instanceQName?: string, method?: string) {
        console.log("[PropertyServices] getPropertiesTree");
        var params: any = {}
        if (instanceQName != undefined) {
            params.instanceQName = instanceQName;
            params.method = method;
        }
        return this.httpMgr.doGet(this.serviceName, "getPropertiesTree", params, this.oldTypeService);
    }

    getPropertyList(role: string, subPropOf: string, notSubPropOf: string) {
        console.log("[PropertyServices] getPropertyList");
        var params: any = {
            role: role,
            subPropOf: subPropOf,
            notSubPropOf: notSubPropOf,
        };
        return this.httpMgr.doGet(this.serviceName, "getPropertyList", params, this.oldTypeService);
    }

    getSubProperties(propertyQName: string) {
        console.log("[PropertyServices] getSubProperties");
        var params: any = {
            propertyQName: propertyQName,
        };
        return this.httpMgr.doGet(this.serviceName, "getSubProperties", params, this.oldTypeService);
    }

    getRootPropertyList() {
        console.log("[PropertyServices] getRootPropertyList");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getRootPropertyList", params, this.oldTypeService);
    }

    getObjPropertyTree(instanceQName: string) {
        console.log("[PropertyServices] getObjPropertyTree");
        var params: any = {
            instanceQName: instanceQName,
        };
        return this.httpMgr.doGet(this.serviceName, "getObjPropertyTree", params, this.oldTypeService);
    }

    getDatatypePropertiesTree(instanceQName: string) {
        console.log("[PropertyServices] getDatatypePropertiesTree");
        var params: any = {
            instanceQName: instanceQName,
        };
        return this.httpMgr.doGet(this.serviceName, "getDatatypePropertiesTree", params, this.oldTypeService);
    }

    getAnnotationPropertiesTree(instanceQName: string) {
        console.log("[PropertyServices] getAnnotationPropertiesTree");
        var params: any = {
            instanceQName: instanceQName,
        };
        return this.httpMgr.doGet(this.serviceName, "getAnnotationPropertiesTree", params, this.oldTypeService);
    }

    removeProperty(name: string) {
        console.log("[PropertyServices] removeProperty");
        var params: any = {
            name: name,
        };
        return this.httpMgr.doGet("delete", "removeProperty", params, this.oldTypeService);
    }

    addProperty(propertyQName: string, propertyType: string) {
        console.log("[PropertyServices] addProperty");
        var params: any = {
            propertyQName: propertyQName,
            propertyType: propertyType,
        };
        return this.httpMgr.doGet(this.serviceName, "addProperty", params, this.oldTypeService);
    }

    addSubProperty(propertyQName: string, propertyType: string, superPropertyQName: string) {
        console.log("[PropertyServices] addSubProperty");
        var params: any = {
            propertyQName: propertyQName,
            propertyType: propertyType,
            superPropertyQName: superPropertyQName,
        };
        return this.httpMgr.doGet(this.serviceName, "addProperty", params, this.oldTypeService);
    }

    getRangeClassesTree(propertyQName: string) {
        console.log("[PropertyServices] getRangeClassesTree");
        var params: any = {
            propertyQName: propertyQName,
        };
        return this.httpMgr.doGet(this.serviceName, "getRangeClassesTree", params, this.oldTypeService);
    }

    getPropertyDescription(propertyQName: string) {
        console.log("[PropertyServices] getPropertyDescription");
        var params: any = {
            propertyQName: propertyQName,
        };
        return this.httpMgr.doGet(this.serviceName, "getPropertyDescription", params, this.oldTypeService);
    }

    removePropValue(instanceQName: string, propertyQName: string, value: string, rangeQName: string, type: string, lang: string) {
        console.log("[PropertyServices] removePropValue");
        var params: any = {
            instanceQName: instanceQName,
            propertyQName: propertyQName,
            value: value,
            rangeQName: rangeQName,
            type: type,
            lang: lang,
        };
        return this.httpMgr.doGet(this.serviceName, "removePropValue", params, this.oldTypeService);
    }

    createAndAddPropValue(instanceQName: string, propertyQName: string, value: string, rangeQName: string, type: string, lang: string) {
        console.log("[PropertyServices] createAndAddPropValue");
        var params: any = {
            instanceQName: instanceQName,
            propertyQName: propertyQName,
            value: value,
            rangeQName: rangeQName,
            type: type,
            lang: lang,
        };
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
        return this.httpMgr.doGet(this.serviceName, "removeSuperProperty", params, this.oldTypeService);
    }

    getDomain(propertyQName: string) {
        console.log("[PropertyServices] getDomain");
        var params: any = {
            propertyQName: propertyQName,
        };
        return this.httpMgr.doGet(this.serviceName, "getDomain", params, this.oldTypeService);
    }

    getRange(propertyQName: string, visualize: string) {
        console.log("[PropertyServices] getRange");
        var params: any = {
            propertyQName: propertyQName,
            visualize: visualize,
        };
        return this.httpMgr.doGet(this.serviceName, "getRange", params, this.oldTypeService);
    }

    parseDataRange(dataRange: string, nodeType: string) {
        console.log("[PropertyServices] parseDataRange");
        var params: any = {
            dataRange: dataRange,
            nodeType: nodeType,
        };
        return this.httpMgr.doGet(this.serviceName, "parseDataRange", params, this.oldTypeService);
    }

    addPropertyDomain(propertyQName: string, domainPropertyQName: string) {
        console.log("[PropertyServices] addPropertyDomain");
        var params: any = {
            propertyQName: propertyQName,
            domainPropertyQName: domainPropertyQName,
        };
        return this.httpMgr.doGet(this.serviceName, "addPropertyDomain", params, this.oldTypeService);
    }

    removePropertyDomain(propertyQName: string, domainPropertyQName: string) {
        console.log("[PropertyServices] removePropertyDomain");
        var params: any = {
            propertyQName: propertyQName,
            domainPropertyQName: domainPropertyQName,
        };
        return this.httpMgr.doGet(this.serviceName, "removePropertyDomain", params, this.oldTypeService);
    }

    addPropertyRange(propertyQName: string, rangePropertyQName: string) {
        console.log("[PropertyServices] addPropertyRange");
        var params: any = {
            propertyQName: propertyQName,
            rangePropertyQName: rangePropertyQName,
        };
        return this.httpMgr.doGet(this.serviceName, "addPropertyRange", params, this.oldTypeService);
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