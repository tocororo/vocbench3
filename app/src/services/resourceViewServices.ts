import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";
import {ARTURIResource} from "../utils/ARTResources";


@Injectable()
export class ResourceViewServices {

    private serviceName = "ResourceView";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the resource view of the given resource
     * @param resource
     */
    getResourceView(resource: ARTURIResource) {
        console.log("[resourceViewServices] getResourceView");
        var params: any = {
            resource: resource.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "getResourceView", params, this.oldTypeService);
    }

}