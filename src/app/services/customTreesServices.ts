import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTResource } from '../models/ARTResources';
import { Deserializer } from '../utils/Deserializer';
import { HttpManager, STRequestParams } from "../utils/HttpManager";

@Injectable()
export class CustomTreesServices {

    private serviceName = "CustomTrees";

    constructor(private httpMgr: HttpManager) { }

    getRoots(): Observable<ARTResource[]> {
        let params: STRequestParams = {};
        return this.httpMgr.doGet(this.serviceName, "getRoots", params).pipe(
            map(stResp => {
                return Deserializer.createResourceArray(stResp);
            })
        );
    }

    getChildrenResources(resource: ARTResource): Observable<ARTResource[]> {
        let params: STRequestParams = {
            resource: resource,
        };
        return this.httpMgr.doGet(this.serviceName, "getChildrenResources", params).pipe(
            map(stResp => {
                return Deserializer.createResourceArray(stResp);
            })
        );
    }

}