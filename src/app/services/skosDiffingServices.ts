import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Project } from '../models/Project';
import { DiffingTask, TaskResultType } from '../models/SkosDiffing';
import { HttpManager, STRequestParams } from "../utils/HttpManager";

@Injectable()
export class SkosDiffingServices {

    private serviceName = "SkosDiffing";

    constructor(private httpMgr: HttpManager) { }

    runDiffing(leftProject: Project, rightProject: Project, leftVersionRepoId?: string, rightVersionRepoId?: string, langList?: string[]): Observable<string> {
        let params: STRequestParams = {
            leftProjectName: leftProject.getName(),
            rightProjectName: rightProject.getName(),
            leftVersionRepoId: leftVersionRepoId,
            rightVersionRepoId: rightVersionRepoId,
            langList: langList
        };
        return this.httpMgr.doPost(this.serviceName, "runDiffing", params);
    }

    getAllTasksInfo(projectName: string): Observable<DiffingTask[]> {
        let params: STRequestParams = {
            projectName: projectName
        };
        return this.httpMgr.doGet(this.serviceName, "getAllTasksInfo", params);
    }

    deleteTask(taskId: string) {
        let params: STRequestParams = {
            taskId: taskId
        };
        return this.httpMgr.doPost(this.serviceName, "deleteTask", params);
    }

    getTaskResult(taskId: string, resultType: TaskResultType) {
        let params: STRequestParams = {
            taskId: taskId,
            resultType,
        };
        return this.httpMgr.downloadFile(this.serviceName, "getTaskResult", params);
    }

}