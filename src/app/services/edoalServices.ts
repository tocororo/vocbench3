import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class EdoalServices {

    private serviceName = "EDOAL";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Pair of projects' names
     */
    getAlignedProjects(): Observable<string[]> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getAlignedProjects", params);
    }

}