import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Report, InvokableReporter, ServiceInvocationDefinition } from '../models/InvokableReporter';
import { HttpManager } from "../utils/HttpManager";
import { ConfigurationComponents } from '../models/Configuration';

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

    /**
     * TODO in attesa di un servizio in ST, uso il servizio in Configurations
     * @param id 
     */
    getInvokableReporter(id: string): Observable<InvokableReporter> {
        var params = {
            componentID: ConfigurationComponents.INVOKABLE_REPORER_STORE,
            relativeReference: "sys:" + id
        }
        return this.httpMgr.doGet("Configurations", "getConfiguration", params).map(
            stResp => {
                let config = <InvokableReporter>InvokableReporter.parse(stResp);
                config.id = id; //useful to keep trace of id in case of future update
                let invocations: ServiceInvocationDefinition[] = config.getPropertyValue("serviceInvocations");
                if (invocations != null) {
                    invocations.forEach(i => i.reporterId = id); //add the reporter id to each invocation (useful when the invocation is edited)
                    invocations.sort((i1, i2) => (i1.service + "." + i1.operation).localeCompare(i2.service + "." + i2.operation)); //sort invocations
                }
                return config;
            }
        );
    }

}



