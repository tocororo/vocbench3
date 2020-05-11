import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Report } from '../models/InvokableReporter';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class InvokableReportersServices {

    private serviceName = "InvokableReporters";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Checks if a manchester expression in valid
     * @param manchExpr manchester expression to check
     */
    compileReport(reporterReference: string): Observable<Report> {
        var params = {
            reporterReference: reporterReference
        };
        return this.httpMgr.doGet(this.serviceName, "compileReport", params);
    }

}



