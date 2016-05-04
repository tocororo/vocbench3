import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {ARTResource, ARTURIResource, ARTNode} from "../utils/ARTResources";

@Injectable()
export class ResourceServices {

    private serviceName = "Resource";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Removes a property-value to a resource
     * (used in ResourceView properties partition instead of Property.removePropValue)
     */
    removePropertyValue(subject: ARTResource, predicate: ARTURIResource, object: ARTNode) {
        console.log("[ResourceServices] removePropertyValue");
        console.log("object " + JSON.stringify(object));
        var params: any = {
            subject : subject.toNT(),
            predicate : predicate.toNT(),
            object : object.toNT()
        };
        return this.httpMgr.doGet(this.serviceName, "removePropertyValue", params, this.oldTypeService);
    }

}