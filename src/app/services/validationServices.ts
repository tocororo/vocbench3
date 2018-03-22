import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommitInfo, ParameterInfo, SortingDirection } from "../models/History";
import { ARTURIResource } from "../models/ARTResources";
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";

@Injectable()
export class ValidationServices {

    private serviceName = "Validation";

    constructor(private httpMgr: HttpManager) { }


    /**
     * 
     * @param operationFilter 
     * @param timeLowerBound 
     * @param timeUpperBound 
     * @param limit 
     */
    getStagedCommitSummary(operationFilter?: ARTURIResource[], timeLowerBound?: string, timeUpperBound?: string, limit?: number) {
        console.log("[ValidationServices] getStagedCommitSummary");
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
        return this.httpMgr.doGet(this.serviceName, "getStagedCommitSummary", params).map(
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
    getCommits(timeUpperBound: string, operationFilter?: ARTURIResource[], timeLowerBound?: string,
            operationSorting?: SortingDirection, timeSorting?: SortingDirection, page?: number, limit?: number): Observable<CommitInfo[]> {
        console.log("[ValidationServices] getCommits");
        var params: any = {
            timeUpperBound: timeUpperBound
        };
        if (operationFilter != null) { params.operationFilter = operationFilter; }
        if (timeUpperBound != null) { params.timeUpperBound = timeUpperBound; }
        if (operationSorting != null) { params.operationSorting = operationSorting; }
        if (timeSorting != null) { params.timeSorting = timeSorting; }
        if (page != null) { params.page = page; }
        if (limit != null) { params.limit = limit; }
        
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
     * Accept the given commit
     * @param validatableCommit 
     */
    accept(validatableCommit: ARTURIResource) {
        console.log("[ValidationServices] accept");
        var params: any = {
            validatableCommit: validatableCommit
        };
        return this.httpMgr.doPost(this.serviceName, "accept", params);
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
        return this.httpMgr.doPost(this.serviceName, "reject", params);
    }

}