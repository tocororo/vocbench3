import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationMetadata } from '../models/Undo';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class UndoServices {

    private serviceName = "Undo";

    constructor(private httpMgr: HttpManager) { }

    undo(): Observable<OperationMetadata> {
        let params = {};
        return this.httpMgr.doPost(this.serviceName, "undo", params);
    }

}