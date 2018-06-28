import { Injectable } from '@angular/core';
import { ResourcePosition } from "../models/ARTResources";
import { HttpManager } from "../utils/HttpManager";
import { Observable } from 'rxjs';

@Injectable()
export class MapleServices {

    private serviceName = "MAPLE";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Checks if a manchester expression in valid
     * @param manchExpr manchester expression to check
     */
    profileMediationProblem(resourcePosition: string) {
        console.log("[MapleServices] profileMediationProblem");
        var params = {
            resourcePosition: resourcePosition
        };
        return this.httpMgr.doGet(this.serviceName, "profileMediationProblem", params);
    }

    /**
     * 
     */
    profileProject() {
        console.log("[MapleServices] profileProject");
        var params = {};
        return this.httpMgr.doPost(this.serviceName, "profileProject", params);
    }

    /**
     * 
     */
    checkProjectMetadataAvailability(): Observable<boolean> {
        console.log("[MapleServices] checkProjectMetadataAvailability");
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "checkProjectMetadataAvailability", params);
    }

}