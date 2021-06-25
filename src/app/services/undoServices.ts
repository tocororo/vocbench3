import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommitInfo } from '../models/History';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class UndoServices {

    private serviceName = "Undo";

    constructor(private httpMgr: HttpManager) { }

    undo(): Observable<CommitInfo> {
        let params = {};
        return this.httpMgr.doPost(this.serviceName, "undo", params).pipe(
            map(stResp => {
                return CommitInfo.parse(stResp);
            })
        );
    }

}