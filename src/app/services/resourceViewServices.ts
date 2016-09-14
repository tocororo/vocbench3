import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {ARTResource} from "../utils/ARTResources";


@Injectable()
export class ResourceViewServices {

    private serviceName = "ResourceView";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the resource view of the given resource
     * @param resource
     */
    getResourceView(resource: ARTResource) {
        console.log("[resourceViewServices] getResourceView");
        var params: any = {
            resource: resource.getNominalValue(),
        };
        return this.httpMgr.doGet(this.serviceName, "getResourceView", params, this.oldTypeService);
    }

}