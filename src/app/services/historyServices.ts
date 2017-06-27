import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommitInfo, CommitOperation, SortingDirection } from "../models/History";
import { ARTURIResource } from "../models/ARTResources";
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";

@Injectable()
export class HistoryServices {

    private serviceName = "History";

    constructor(private httpMgr: HttpManager) { }


    /**
     * 
     * @param operationFilter 
     * @param timeLowerBound 
     * @param timeUpperBound 
     * @param limit 
     */
    getCommitSummary(operationFilter?: ARTURIResource[], timeLowerBound?: string, timeUpperBound?: string, limit?: number) {
        console.log("[HistoryServices] getCommitSummary");
        var params: any = {};
        if (operationFilter != null) {
            params.operationFilter = operationFilter;
        }
        if (timeLowerBound != null) {
            params.timeLowerBound = timeLowerBound;
        }
        if (timeUpperBound != null) {
            params.timeUpperBound = timeUpperBound;
        }
        if (limit != null) {
            params.limit = limit;
        }
        return this.httpMgr.doGet(this.serviceName, "getCommitSummary", params, true).map(
            stResp => {
                return stResp;
            }
        );
    }

    /**
     * 
     * @param tipRevisionNumber 
     * @param operationFilter 
     * @param timeLowerBound 
     * @param timeUpperBound 
     * @param operationSorting 
     * @param timeSorting 
     * @param page 
     * @param limit 
     */
    getCommits(tipRevisionNumber: number, operationFilter?: ARTURIResource[], timeLowerBound?: string, timeUpperBound?: string,
            operationSorting?: SortingDirection, timeSorting?: SortingDirection, page?: number, limit?: number): Observable<CommitInfo[]> {
        console.log("[HistoryServices] getCommits");
        var params: any = {
            tipRevisionNumber: tipRevisionNumber
        };
        if (operationFilter != null) { params.operationFilter = operationFilter; }
        if (timeLowerBound != null) { params.timeLowerBound = timeLowerBound; }
        if (timeUpperBound != null) { params.timeUpperBound = timeUpperBound; }
        if (operationSorting != null) { params.operationSorting = operationSorting; }
        if (timeSorting != null) { params.timeSorting = timeSorting; }
        if (page != null) { params.page = page; }
        if (limit != null) { params.limit = limit; }
        
        return this.httpMgr.doGet(this.serviceName, "getCommits", params, true).map(
            stResp => {
                var commits: CommitInfo[] = [];
                var commitsJsonArray: any[] = stResp;
                for (var i = 0; i < commitsJsonArray.length; i++) {
                    let commitJson: any = commitsJsonArray[i];

                    let commitUri: ARTURIResource = new ARTURIResource(commitJson.commit);
                    
                    let user: ARTURIResource;
                    let userJson = commitJson.user;
                    if (userJson != null) {
                        user = new ARTURIResource(userJson['@id'], userJson.show);
                    }

                    let operation: ARTURIResource;
                    let operationJson = commitJson.operation;
                    if (operationJson != null) {
                        operation = new ARTURIResource(operationJson['@id']);
                    }

                    let subject: ARTURIResource;
                    if (commitJson.subject != null) {
                        subject = new ARTURIResource(commitJson.subject['@id']);
                    }

                    let startTime: Date;
                    let startTimeJson = commitJson.startTime;
                    if (startTimeJson != null) {
                        startTime = new Date(startTimeJson);
                    }

                    let endTime: Date;
                    let endTimeJson = commitJson.endTime;
                    if (endTimeJson != null) {
                        endTime = new Date(endTimeJson);
                    }
                    
                    let commit: CommitInfo = new CommitInfo(commitUri, user, operation, subject, startTime, endTime);

                    commits.push(commit);
                }
                return commits;
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
        return this.httpMgr.doGet(this.serviceName, "getCommitDelta", params, true).map(
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
