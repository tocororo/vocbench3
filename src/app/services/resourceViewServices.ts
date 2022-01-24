import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTResource, ARTURIResource } from "../models/ARTResources";
import { Deserializer } from "../utils/Deserializer";
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";

@Injectable()
export class ResourceViewServices {

    private serviceName = "ResourceView";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the resource view of the given resource
     * @param resource
     */
    getResourceView(resource: ARTResource, includeInferred?: boolean, resourcePosition?: string): Observable<any> {
        let params: any = {
            resource: resource,
        };
        if (includeInferred != null) {
            params.includeInferred = includeInferred;
        }
        if (resourcePosition != null) {
            params.resourcePosition = resourcePosition;
        }
        let options: VBRequestOptions = new VBRequestOptions({
            errorHandlers: [
                { className: 'java.net.UnknownHostException', action: 'skip' },
            ]
        });
        return this.httpMgr.doGet(this.serviceName, "getResourceView", params, options);
    }

    getResourceViewAtTime(resource: ARTURIResource, date: Date): Observable<any> {
        let params: any = {
            resource: resource,
            date: date.toISOString()
        };
        let options: VBRequestOptions = new VBRequestOptions({
            errorHandlers: [
                { className: 'java.net.UnknownHostException', action: 'skip' },
            ]
        });
        return this.httpMgr.doGet(this.serviceName, "getResourceViewAtTime", params, options);
    }

    /**
     * Returns the lexicalization properties for the given resource
     * @param resource
     * @param resourcePosition ????
     */
    getLexicalizationProperties(resource: ARTResource, resourcePosition?: string): Observable<ARTURIResource[]> {
        let params: any = {
            resource: resource,
        };
        if (resourcePosition != null) {
            params.resourcePosition = resourcePosition;
        }
        return this.httpMgr.doGet(this.serviceName, "getLexicalizationProperties", params).pipe(
            map(stResp => {
                return Deserializer.createURIArray(stResp);
            })
        );
    }


}