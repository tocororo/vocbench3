import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommitInfo, ParameterInfo, CommitOperation, SortingDirection, CommitDelta } from "../models/History";
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
    getCommitSummary(operationFilter?: ARTURIResource[], performerFilter?: ARTURIResource[], validatorFilter?: ARTURIResource[],
        timeLowerBound?: string, timeUpperBound?: string, limit?: number) {
        console.log("[HistoryServices] getCommitSummary");
        var params: any = {
            operationFilter: operationFilter,
            performerFilter: performerFilter,
            validatorFilter: validatorFilter,
            timeLowerBound: timeLowerBound,
            timeUpperBound: timeUpperBound,
            limit: limit
        }
        return this.httpMgr.doGet(this.serviceName, "getCommitSummary", params).map(
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
    getCommits(tipRevisionNumber: number, operationFilter?: ARTURIResource[], performerFilter?: ARTURIResource[], validatorFilter?: ARTURIResource[],
            timeLowerBound?: string, timeUpperBound?: string, operationSorting?: SortingDirection, timeSorting?: SortingDirection, 
            page?: number, limit?: number): Observable<CommitInfo[]> {
        console.log("[HistoryServices] getCommits");
        var params: any = {
            tipRevisionNumber: tipRevisionNumber,

            operationFilter: operationFilter,
            performerFilter: performerFilter,
            validatorFilter: validatorFilter,
            timeLowerBound: timeLowerBound,
            timeUpperBound: timeUpperBound,
            operationSorting: operationSorting,
            timeSorting: timeSorting,
            page: page,
            limit: limit
        };
        return this.httpMgr.doGet(this.serviceName, "getCommits", params).map(
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

                    let operationParameters: ParameterInfo[] = [];
                    let operationParamsJson: any[] = commitJson.operationParameters;
                    if (operationParamsJson != null) {
                        operationParamsJson.forEach(element => {
                            if (element.value != null) {
                                operationParameters.push(new ParameterInfo(element.name, element.value));
                            }
                        });
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
                    
                    let commit: CommitInfo = new CommitInfo(commitUri, user, operation, operationParameters, startTime, endTime);

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
    getCommitDelta(commit: ARTURIResource): Observable<CommitDelta> {
        console.log("[HistoryServices] getCommitDelta");
        var params: any = {
            commit: commit
        };
        return this.httpMgr.doGet(this.serviceName, "getCommitDelta", params).map(
            stResp => {
                let additions: CommitOperation[] = [];
                let removals: CommitOperation[] = [];

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

                let additionsTruncated: number = stResp.additionsTruncated;
                let removalsTruncated: number = stResp.removalsTruncated;

                let commitDelta: CommitDelta = {
                    additions: additions,
                    removals: removals,
                    additionsTruncated: additionsTruncated,
                    removalsTruncated: removalsTruncated
                }

                return commitDelta;
            }
        );
    }

}
