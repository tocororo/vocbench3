import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpManager} from "../utils/HttpManager";
import {ARTResource, ARTURIResource} from "../utils/ARTResources";
import {Deserializer} from "../utils/Deserializer";


@Injectable()
export class ResourceViewServices {

    private serviceName = "ResourceView";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the resource view of the given resource
     * @param resource
     */
    getResourceView_old(resource: ARTResource) {
        console.log("[resourceViewServices] getResourceView");
        var params: any = {
            resource: resource.getNominalValue(),
        };
        return this.httpMgr.doGet(this.serviceName, "getResourceView", params, this.oldTypeService);
    }

    /**
     * Returns the resource view of the given resource
     * @param resource
     */
    getResourceView(resource: ARTResource) {
        console.log("[resourceViewServices] getResourceView");
        var params: any = {
            resource: resource,
        };
        return this.httpMgr.doGet("ResourceView2", "getResourceView", params, this.oldTypeService, true);
    }
    
    /**
     * Returns the lexicalization properties for the given resource
     * @param resource
     * @param resourcePosition ????
     */
    getLexicalizationProperties(resource: ARTResource, resourcePosition?: string): Observable<ARTURIResource[]> {
        console.log("[resourceViewServices] getLexicalizationProperties");
        var params: any = {
            resource: resource,
        };
        if (resourcePosition != null) {
            params.resourcePosition = resourcePosition;
        }
        return this.httpMgr.doGet("ResourceView2", "getLexicalizationProperties", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }


}