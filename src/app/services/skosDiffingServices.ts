import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Project } from '../models/Project';
import { HttpManager, STRequestParams } from "../utils/HttpManager";

@Injectable()
export class SkosDiffingServices {

    private serviceName = "SkosDiffing";

    constructor(private httpMgr: HttpManager) { }

    runDiffing(leftProject: Project, rightProject: Project, leftVersionRepoId?: string, rightVersionRepoId?: string): Observable<void> {
        let params: STRequestParams = {
            leftProjectName: leftProject.getName(),
            rightProjectName: rightProject.getName(),
            leftVersionRepoId: leftVersionRepoId,
            rightVersionRepoId: rightVersionRepoId,
        };
        return this.httpMgr.uploadFile(this.serviceName, "runDiffing", params);
    }

}