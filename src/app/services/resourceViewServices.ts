import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { ARTResource, ARTURIResource } from "../models/ARTResources";

@Injectable()
export class ResourceViewServices {

    private serviceName = "ResourceView";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the resource view of the given resource
     * @param resource
     */
    getResourceView(resource: ARTResource, includeInferred: boolean) {
        console.log("[resourceViewServices] getResourceView");
        var params: any = {
            resource: resource,
        };
        if (includeInferred != null) {
            params.includeInferred = includeInferred;
        }
        return this.httpMgr.doGet(this.serviceName, "getResourceView", params, true);
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
        return this.httpMgr.doGet(this.serviceName, "getLexicalizationProperties", params, true).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }


}