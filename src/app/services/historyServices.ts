import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommitInfo, CommitOperation } from "../models/History";
import { ARTURIResource } from "../models/ARTResources";
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";

@Injectable()
export class HistoryServices {

    private serviceName = "History";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the last commits
     * @param parentCommit if provided, it will return the commits performed after the parentCommit
     * @param limit limit number of commits returned (default 100)
     */
    getCommits(parentCommit?: ARTURIResource, limit?: number): Observable<{ items: CommitInfo[], next: boolean }> {
        console.log("[HistoryServices] getCommits");
        var params: any = {};
        if (parentCommit != null) {
            params.parentCommit = parentCommit;
        }
        if (limit != null) {
            params.limit = limit;
        }
        
        return this.httpMgr.doGet(this.serviceName, "getCommits", params, this.oldTypeService, true).map(
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

                    let startTime: string;
                    let startTimeJson = itemJson.startTime;
                    if (startTimeJson != null) {
                        startTime = Deserializer.parseDateTime(startTimeJson);
                    }

                    let endTime: string;
                    let endTimeJson = itemJson.endTime;
                    if (endTimeJson != null) {
                        endTime = Deserializer.parseDateTime(endTimeJson);
                    }
                    
                    let item: CommitInfo = new CommitInfo(new ARTURIResource(itemJson.commit), user, operation, subject, startTime, endTime);

                    items.push(item);
                }
                return { items: items, next: stResp.next };
            }
        );
    }

    /**
     * Returns the triples added and removed by the given commit
     * @param commit 
     */
    getCommitDelta(commit: ARTURIResource): Observable<{ additions: CommitOperation[], removals: CommitOperation[] }> {
        console.log("[HistoryServices] getCommitDelta");
        var params: any = {
            commit: commit
        };
        return this.httpMgr.doGet(this.serviceName, "getCommitDelta", params, this.oldTypeService, true).map(
            stResp => {
                var additions: CommitOperation[] = [];
                var removals: CommitOperation[] = [];

                var additionsJsonArray: any[] = stResp.additions;
                for (var i = 0; i < additionsJsonArray.length; i++) {
                    let additionJson: any = additionsJsonArray[i];
                    additions.push(
                        new CommitOperation(
                            Deserializer.createRDFResource(additionJson.subject),
                            Deserializer.createURI(additionJson.predicate),
                            Deserializer.createRDFNode(additionJson.object),
                            Deserializer.createRDFResource(additionJson.context)
                        )
                    );
                }

                var removalsJsonArray: any[] = stResp.removals;
                for (var i = 0; i < removalsJsonArray.length; i++) {
                    let removalJson: any = removalsJsonArray[i];
                    removals.push(
                        new CommitOperation(
                            Deserializer.createRDFResource(removalJson.subject),
                            Deserializer.createURI(removalJson.predicate),
                            Deserializer.createRDFNode(removalJson.object),
                            Deserializer.createRDFResource(removalJson.context)
                        )
                    );
                }

                return { additions: additions, removals: removals };
            }
        );
    }

}