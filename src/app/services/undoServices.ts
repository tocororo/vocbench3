import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommitInfo } from '../models/History';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";

@Injectable()
export class UndoServices {

    private serviceName = "Undo";

    constructor(private httpMgr: HttpManager) { }

    undo(): Observable<CommitInfo> {
        let params = {};
        let options: VBRequestOptions = new VBRequestOptions({
            errorHandlers: [
                { className: 'org.eclipse.rdf4j.repository.RepositoryException', action: 'skip' }, //when undo stack is empty (contains a message "...SailException: Empty undo stack")
            ]
        });
        return this.httpMgr.doPost(this.serviceName, "undo", params, options).pipe(
            map(stResp => {
                return CommitInfo.parse(stResp);
            })
        );
    }

}