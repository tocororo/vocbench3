import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTURIResource } from "../models/ARTResources";
import { CommitDelta, CommitInfo, CommitOperation, HistoryPaginationInfo, SortingDirection } from "../models/History";
import { Deserializer } from "../utils/Deserializer";
import { HttpManager } from "../utils/HttpManager";

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
        resourceFilter?: ARTURIResource[], timeLowerBound?: string, timeUpperBound?: string, limit?: number): Observable<HistoryPaginationInfo> {
        let params: any = {
            operationFilter: operationFilter,
            performerFilter: performerFilter,
            validatorFilter: validatorFilter,
            resourceFilter: resourceFilter,
            timeLowerBound: timeLowerBound,
            timeUpperBound: timeUpperBound,
            limit: limit
        };
        return this.httpMgr.doGet(this.serviceName, "getCommitSummary", params).pipe(
            map(stResp => {
                return stResp;
            })
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
            resourceFilter?: ARTURIResource[], timeLowerBound?: string, timeUpperBound?: string, operationSorting?: SortingDirection, timeSorting?: SortingDirection, 
            page?: number, limit?: number): Observable<CommitInfo[]> {
        let params: any = {
            tipRevisionNumber: tipRevisionNumber,
            operationFilter: operationFilter,
            performerFilter: performerFilter,
            validatorFilter: validatorFilter,
            resourceFilter: resourceFilter,
            timeLowerBound: timeLowerBound,
            timeUpperBound: timeUpperBound,
            operationSorting: operationSorting,
            timeSorting: timeSorting,
            page: page,
            limit: limit
        };
        return this.httpMgr.doGet(this.serviceName, "getCommits", params).pipe(
            map(stResp => {
                let commits: CommitInfo[] = [];
                for (let commitJson of stResp) {
                    commits.push(CommitInfo.parse(commitJson));
                }
                return commits;
            })
        );
    }

    /**
     * Returns the triples added and removed by the given commit
     * @param commit 
     */
    getCommitDelta(commit: ARTURIResource): Observable<CommitDelta> {
        let params: any = {
            commit: commit
        };
        return this.httpMgr.doGet(this.serviceName, "getCommitDelta", params).pipe(
            map(stResp => {
                let additions: CommitOperation[] = [];
                let removals: CommitOperation[] = [];

                let additionsJsonArray: any[] = stResp.additions;
                for (let i = 0; i < additionsJsonArray.length; i++) {
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

                let removalsJsonArray: any[] = stResp.removals;
                for (let i = 0; i < removalsJsonArray.length; i++) {
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
                };

                return commitDelta;
            })
        );
    }

    getTimeOfOrigin(resource?: ARTURIResource): Observable<Date> {
        let params = {
            resource: resource
        };
        return this.httpMgr.doGet(this.serviceName, "getTimeOfOrigin", params).pipe(
            map(datetime => {
                return new Date(datetime);
            })
        );
    }

}
