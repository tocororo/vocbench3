import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class ResourceViewServices {

    private serviceName = "ResourceView";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    getResourceView(resource: string) {
        console.log("[resourceViewServices] getResourceView");
        var params: any = {
            resource: resource,
        };
        return this.httpMgr.doGet(this.serviceName, "getResourceView", params, this.oldTypeService);
    }

}