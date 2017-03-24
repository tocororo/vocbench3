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

}