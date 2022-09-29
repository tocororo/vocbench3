import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTResource, ARTURIResource } from '../models/ARTResources';
import { Deserializer } from '../utils/Deserializer';
import { HttpManager, STRequestParams } from "../utils/HttpManager";

@Injectable()
export class CustomTreesServices {

    private serviceName = "CustomTrees";

    constructor(private httpMgr: HttpManager) { }

    getRoots(cls: ARTResource, childProp: ARTURIResource, invHierarchyDirection?: boolean, includeSubProp?: boolean, includeSubclasses?: boolean): Observable<ARTResource[]> {
        let params: STRequestParams = {
            cls: cls,
            childProp: childProp,
            invHierarchyDirection: invHierarchyDirection,
            includeSubProp: includeSubProp,
            includeSubclasses: includeSubclasses,
        };
        return this.httpMgr.doGet(this.serviceName, "getRoots", params).pipe(
            map(stResp => {
                return Deserializer.createResourceArray(stResp);
            })
        );
    }

    getChildrenResources(parent: ARTResource, cls: ARTResource, childProp: ARTURIResource, invHierarchyDirection?: boolean, includeSubProp?: boolean, includeSubclasses?: boolean): Observable<ARTResource[]> {
        let params: STRequestParams = {
            cls: cls,
            parent: parent,
            childProp: childProp,
            invHierarchyDirection: invHierarchyDirection,
            includeSubProp: includeSubProp,
            includeSubclasses: includeSubclasses,
        };
        return this.httpMgr.doGet(this.serviceName, "getChildrenResources", params).pipe(
            map(stResp => {
                return Deserializer.createResourceArray(stResp);
            })
        );
    }

}