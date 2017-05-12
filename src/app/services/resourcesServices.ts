import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {ARTResource, ARTURIResource, ARTNode} from "../models/ARTResources";

@Injectable()
export class ResourcesServices {

    private serviceName = "Resources";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Updates the value of a triple replacing the old value with the new one
     * @param resource
     * @param property
     * @param value
     * @param newValue
     */
    updateTriple(resource: ARTResource, property: ARTURIResource, value: ARTNode, newValue: ARTNode) {
        console.log("[ResourcesServices] updateTriple");
        var params: any = {
            resource : resource,
            property : property,
            value : value,
            newValue: newValue
        };
        return this.httpMgr.doGet(this.serviceName, "updateTriple", params, this.oldTypeService, true);
    }

    /**
     * Remove a triple
     * @param resource
     * @param property
     * @param value
     */
    removeTriple(resource: ARTResource, property: ARTURIResource, value: ARTNode) {
        console.log("[ResourcesServices] removeTriple");
        var params: any = {
            resource : resource,
            property : property,
            value : value
        };
        return this.httpMgr.doGet(this.serviceName, "removeTriple", params, this.oldTypeService, true);
    }

    /**
     * Set a resource as deprecated
     * @param resource
     */
    setDeprecated(resource: ARTResource) {
        console.log("[ResourcesServices] setDeprecated");
        var params: any = {
            resource : resource,
        };
        return this.httpMgr.doGet(this.serviceName, "setDeprecated", params, this.oldTypeService, true);
    }

}