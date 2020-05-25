import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTURIResource } from '../models/ARTResources';
import { RemoteAlignmentTask } from '../models/RemoteAlignment';
import { MatchingProblem } from '../models/Maple';
import { Project } from '../models/Project';
import { HttpManager } from "../utils/HttpManager";
import { AlignmentOverview } from '../models/Alignment';

@Injectable()
export class RemoteAlignmentServices {

    private serviceName = "RemoteAlignmentServices";

    constructor(private httpMgr: HttpManager) { }

    listTasks(leftDataset: Project, allowReordering: boolean, rightDataset?: Project): Observable<RemoteAlignmentTask[]> {
        var params: any = {
            leftDataset: leftDataset.getName(),
            allowReordering: allowReordering
        };
        if (rightDataset != null) {
            params.rightDataset = rightDataset.getName();
        }
        return this.httpMgr.doGet(this.serviceName, "listTasks", params).map(
            stResp => {
                let tasks: RemoteAlignmentTask[] = [];
                stResp.forEach((result: any) => {
                    let task: RemoteAlignmentTask = {
                        id: result.id,
                        leftDataset: {
                            projectName: result.leftDataset.projectName,
                            datasetIRI: new ARTURIResource(result.leftDataset.datasetIRI),
                            baseURI: result.leftDataset.baseURI,
                            model: new ARTURIResource(result.leftDataset.model),
                            lexicalizationModel: new ARTURIResource(result.leftDataset.lexicalizationModel),
                            open: result.leftDataset.open
                        },
                        rightDataset: {
                            projectName: result.rightDataset.projectName,
                            datasetIRI: new ARTURIResource(result.rightDataset.datasetIRI),
                            baseURI: result.rightDataset.baseURI,
                            model: new ARTURIResource(result.rightDataset.model),
                            lexicalizationModel: new ARTURIResource(result.rightDataset.lexicalizationModel),
                            open: result.rightDataset.open
                        },
                        status: result.status,
                        progress: result.progress,
                        reason: result.reason,
                        startTime: result.startTime,
                        endTime: result.endTime
                    }
                    tasks.push(task);
                });
                return tasks;
            }
        )
    }

    fetchAlignment(taskId: string): Observable<AlignmentOverview> {
        var params: any = {
            taskId: taskId
        };
        return this.httpMgr.doPost(this.serviceName, "fetchAlignment", params);
    }

    /**
     * Returns the taskId
     * @param matchingProblem 
     */
    createTask(matchingProblem: MatchingProblem): Observable<string> {
        var params: any = {
            matchingProblem: JSON.stringify(matchingProblem)
        };
        return this.httpMgr.doPost(this.serviceName, "createTask", params);
    }

    deleteTask(id: string) {
        var params: any = {
            id: id
        };
        return this.httpMgr.doPost(this.serviceName, "deleteTask", params);
    }

    downloadAlignment(taskId: string): Observable<Blob> {
        var params: any = {
            taskId: taskId
        };
        return this.httpMgr.downloadFile(this.serviceName, "downloadAlignment", params);
    }

}