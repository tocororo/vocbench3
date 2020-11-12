import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTURIResource } from "../models/ARTResources";
import { CommitInfo, ParameterInfo, SortingDirection } from "../models/History";
import { HttpManager } from "../utils/HttpManager";

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
    getStagedCommitSummary(operationFilter?: ARTURIResource[], performerFilter?: ARTURIResource[], timeLowerBound?: string,
        timeUpperBound?: string, limit?: number) {
        var params: any = {
            operationFilter: operationFilter,
            performerFilter: performerFilter,
            timeLowerBound: timeLowerBound,
            timeUpperBound: timeUpperBound,
            limit: limit
        };
        return this.httpMgr.doGet(this.serviceName, "getStagedCommitSummary", params);
    }

    getCurrentUserStagedCommitSummary(operationFilter?: ARTURIResource[], timeLowerBound?: string, timeUpperBound?: string, limit?: number) {
        var params: any = {
            operationFilter: operationFilter,
            timeLowerBound: timeLowerBound,
            timeUpperBound: timeUpperBound,
            limit: limit
        };
        return this.httpMgr.doGet(this.serviceName, "getCurrentUserStagedCommitSummary", params);
    }

    /**
     * 
     * @param operationFilter 
     * @param timeUpperBound 
     * @param timeLowerBound 
     * @param operationSorting 
     * @param timeSorting 
     * @param page 
     * @param limit 
     */
    getCommits(operationFilter?: ARTURIResource[], performerFilter?: ARTURIResource[], timeUpperBound?: string, timeLowerBound?: string,
        operationSorting?: SortingDirection, timeSorting?: SortingDirection, page?: number, limit?: number): Observable<CommitInfo[]> {
        var params: any = {
            operationFilter: operationFilter,
            performerFilter: performerFilter,
            timeLowerBound: timeLowerBound,
            timeUpperBound: timeUpperBound,
            operationSorting: operationSorting,
            timeSorting: timeSorting,
            page: page,
            limit: limit
        };

        return this.httpMgr.doGet(this.serviceName, "getCommits", params).pipe(
            map(stResp => {
                return this.parseCommitInfoList(stResp);
            })
        );
    }

    getCurrentUserCommits(operationFilter?: ARTURIResource[], timeUpperBound?: string, timeLowerBound?: string,
        operationSorting?: SortingDirection, timeSorting?: SortingDirection, page?: number, limit?: number): Observable<CommitInfo[]> {
        var params: any = {
            operationFilter: operationFilter,
            timeLowerBound: timeLowerBound,
            timeUpperBound: timeUpperBound,
            operationSorting: operationSorting,
            timeSorting: timeSorting,
            page: page,
            limit: limit
        };

        return this.httpMgr.doGet(this.serviceName, "getCurrentUserCommits", params).pipe(
            map(stResp => {
                return this.parseCommitInfoList(stResp);
            })
        );
    }

    private parseCommitInfoList(commitsJsonArray: any[]): CommitInfo[] {
        let commits: CommitInfo[] = [];
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

            let ca: boolean = commitJson.commentAllowed;
            let commit: CommitInfo = new CommitInfo(commitUri, user, operation, operationParameters, startTime, endTime, ca);

            commits.push(commit);
        }
        return commits;
    }

    /**
     * Accept the given commit
     * @param validatableCommit 
     */
    accept(validatableCommit: ARTURIResource) {
        var params: any = {
            validatableCommit: validatableCommit
        };
        return this.httpMgr.doPost(this.serviceName, "accept", params);
    }

    /**
     * Reject the given commit
     * @param validatableCommit
     * @param comment
     */
    reject(validatableCommit: ARTURIResource, comment?: string) {
        var params: any = {
            validatableCommit: validatableCommit,
            comment: comment
        };
        return this.httpMgr.doPost(this.serviceName, "reject", params);
    }

    /**
     * Reject the given commit
     * @param validatableCommit
     * @param comment
     */
    rejectCurrentUserCommit(validatableCommit: ARTURIResource, comment?: string) {
        var params: any = {
            validatableCommit: validatableCommit,
            comment: comment
        };
        return this.httpMgr.doPost(this.serviceName, "rejectCurrentUserCommit", params);
    }

}