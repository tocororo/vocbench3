import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { ARTResource, ARTURIResource } from "../models/ARTResources";
import { VersionInfo } from "../models/History";


@Injectable()
export class ResourceViewServices {

    private serviceName = "ResourceView";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the resource view of the given resource
     * @param resource
     */
    getResourceView(resource: ARTResource, version?: VersionInfo) {
        console.log("[resourceViewServices] getResourceView");
        var params: any = {
            resource: resource,
        };
        var options: VBRequestOptions;
        if (version != null) {
            options = new VBRequestOptions({ versionId : version.versionId });
        }
        return this.httpMgr.doGet("ResourceView2", "getResourceView", params, true, options);
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
        return this.httpMgr.doGet("ResourceView2", "getLexicalizationProperties", params, true).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }


}