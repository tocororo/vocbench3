import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTURIResource } from '../models/ARTResources';
import { Configuration } from '../models/Configuration';
import { Operation } from '../models/CustomService';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class ServicesServices {

    private serviceName = "Services";

    constructor(private httpMgr: HttpManager) { }


    /**
     * Returns a list of extension path (e.g. "it.uniroma2.art.semanticturkey/st-core-services")
     */
    getExtensionPaths(): Observable<string[]> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getExtensionPaths", params);
    }

    /**
     * Returns a list of service classes of the given extension path (e.g. "Repositories", "SPARQL", "OntManager", ...)
     * @param extensionPath 
     */
    getServiceClasses(extensionPath: string): Observable<string[]> {
        let params: any = {
            extensionPath: extensionPath
        };
        return this.httpMgr.doGet(this.serviceName, "getServiceClasses", params).pipe(
            map(stResp => {
                stResp.sort(
                    function (sc1: string, sc2: string) {
                        if (sc1 > sc2) return 1;
                        if (sc1 < sc2) return -1;
                        return 0;
                    }
                );
                return stResp;
            })
        );
    }

    /**
     * 
     * @param extensionPath 
     * @param serviceClass 
     */
    getServiceOperations(extensionPath: string, serviceClass: string): Observable<string[]> {
        let params: any = {
            extensionPath: extensionPath,
            serviceClass: serviceClass
        };
        return this.httpMgr.doGet(this.serviceName, "getServiceOperations", params).pipe(
            map(stResp => {
                stResp.sort();
                return stResp;
            })
        );
    }


    getServiceOperation(operationIRI: ARTURIResource): Observable<any> {
        let params = {
            operationIRI: operationIRI,
        };
        return this.httpMgr.doGet(this.serviceName, "getServiceOperation", params);
    }


    getServiceOperationAsCustomService(operationIRI: ARTURIResource): Observable<Operation> {
        let params = {
            operationIRI: operationIRI,
        };
        return this.httpMgr.doGet(this.serviceName, "getServiceOperationAsCustomService", params).pipe(
            map(stResp => {
                return Configuration.parse(stResp);
            })
        );
    }

 
    getServiceInvocationForm(operationIRI: ARTURIResource): Observable<any> {
        let params = {
            operationIRI: operationIRI,
        };
        return this.httpMgr.doGet(this.serviceName, "getServiceInvocationForm", params);
    }


}
