import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommitInfo } from "../models/History";
import { ARTURIResource } from "../models/ARTResources";
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";

@Injectable()
export class ValidationServices {

    private serviceName = "Validation";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the staged commits
     * @param limit limit number of commits returned (default 100)
     */
    getStagedCommits(limit?: number): Observable<{ items: CommitInfo[], next: boolean }> {
        console.log("[ValidationServices] getStagedCommits");
        var params: any = {};
        if (limit != null) {
            params.limit = limit;
        }
        
        return this.httpMgr.doGet(this.serviceName, "getStagedCommits", params, true).map(
            stResp => {
                var items: CommitInfo[] = [];
                var itemsJsonArray: any[] = stResp.items;
                for (var i = 0; i < itemsJsonArray.length; i++) {
                    let itemJson: any = itemsJsonArray[i];

                    let commit: ARTURIResource = new ARTURIResource(itemJson.commit);
                    
                    let user: ARTURIResource;
                    let userJson = itemJson.user;
                    if (userJson != null) {
                        user = new ARTURIResource(userJson['@id'], userJson.show);
                    }

                    let operation: ARTURIResource;
                    let operationJson = itemJson.operation;
                    if (operationJson != null) {
                        operation = new ARTURIResource(operationJson['@id']);
                    }

                    let subject: ARTURIResource;
                    if (itemJson.subject != null) {
                        subject = new ARTURIResource(itemJson.subject['@id']);
                    }

                    let startTime: Date;
                    let startTimeJson = itemJson.startTime;
                    if (startTimeJson != null) {
                        startTime = new Date(startTimeJson);
                    }

                    let endTime: Date;
                    let endTimeJson = itemJson.endTime;
                    if (endTimeJson != null) {
                        endTime = new Date(endTimeJson);
                    }
                    
                    let item: CommitInfo = new CommitInfo(new ARTURIResource(itemJson.commit), user, operation, subject, startTime, endTime);

                    items.push(item);
                }
                return { items: items, next: stResp.next };
            }
        );
    }

    /**
     * Accept the given commit
     * @param validatableCommit 
     */
    accept(validatableCommit: ARTURIResource) {
        console.log("[ValidationServices] accept");
        var params: any = {
            validatableCommit: validatableCommit
        };
        return this.httpMgr.doPost(this.serviceName, "accept", params, true);
    }

    /**
     * Reject the given commit
     * @param validatableCommit 
     */
    reject(validatableCommit: ARTURIResource) {
        console.log("[ValidationServices] reject");
        var params: any = {
            validatableCommit: validatableCommit
        };
        return this.httpMgr.doPost(this.serviceName, "reject", params, true);
    }

}