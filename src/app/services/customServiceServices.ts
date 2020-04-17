import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../models/Configuration';
import { CustomService } from '../models/CustomService';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class CustomServiceServices {

    private serviceName = "CustomServices";

    constructor(private httpMgr: HttpManager) { }

    /**
     * 
     */
    getCustomServiceIdentifiers(): Observable<string[]> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getCustomServiceIdentifiers", params);
    }

    /**
     * 
     * @param id 
     */
    getCustomService(id: string): Observable<CustomService> {
        let params: any = {
            id: id
        }
        return this.httpMgr.doGet(this.serviceName, "getCustomService", params).map(
            stResp => {
                let config = <CustomService>CustomService.parse(stResp);
                config.id = id; //useful to keep trace of id in case of future update
                return config;
            }
        );
    }

    /**
     * 
     * @param id 
     * @param definition 
     */
    createCustomService(id: string, definition: { [key: string]: any }): Observable<void> {
        let params: any = {
            id: id,
            definition: JSON.stringify(definition)
        };
        return this.httpMgr.doPost(this.serviceName, "createCustomService", params);
    }

    /**
     * 
     * @param id 
     * @param definition 
     */
    updateCustomService(id: string, definition: { [key: string]: any }): Observable<void> {
        let params: any = {
            id: id,
            definition: JSON.stringify(definition)
        };
        return this.httpMgr.doPost(this.serviceName, "updateCustomService", params);
    }

    /**
     * 
     * @param id 
     */
    deleteCustomService(id: string): Observable<void> {
        let params: any = {
            id: id,
        };
        return this.httpMgr.doPost(this.serviceName, "deleteCustomService", params);
    }

    /**
     * 
     */
    getOperationForms(): Observable<Configuration[]> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getOperationForms", params).map(
            stResp => {
                let configs: Configuration[] = [];
                stResp.forEach((c: any) => {
                    configs.push(Configuration.parse(c));
                })
                return configs;
            }
        );
    }

    /**
     * 
     * @param id 
     * @param operationDefinition 
     */
    addOperationToCustomService(id: string, operationDefinition: { [key: string]: any }): Observable<void> {
        let params: any = {
            id: id,
            operationDefinition: JSON.stringify(operationDefinition)
        };
        return this.httpMgr.doPost(this.serviceName, "addOperationToCustomService", params);
    }

    /**
     * 
     * @param id 
     * @param operationName 
     */
    removeOperationFromCustomService(id: string, operationName: string): Observable<void> {
        let params: any = {
            id: id,
            operationName: operationName
        };
        return this.httpMgr.doPost(this.serviceName, "removeOperationFromCustomService", params);
    }

    /**
     * 
     * @param id 
     * @param operationDefinition 
     * @param oldOperationName 
     */
    updateOperationInCustomService(id: string, operationDefinition: { [key: string]: any }, oldOperationName?: string): Observable<void> {
        let params: any = {
            id: id,
            operationDefinition: JSON.stringify(operationDefinition),
            oldOperationName: oldOperationName
        };
        return this.httpMgr.doPost(this.serviceName, "updateOperationInCustomService", params);
    }

    /**
     * 
     * @param id 
     */
    reloadCustomService(id: string): Observable<void> {
        let params: any = {
            id: id
        };
        return this.httpMgr.doPost(this.serviceName, "reloadCustomService", params);
    }

    
    reloadCustomServices(): Observable<void> {
        let params: any = {};
        return this.httpMgr.doPost(this.serviceName, "reloadCustomServices", params);
    }


}