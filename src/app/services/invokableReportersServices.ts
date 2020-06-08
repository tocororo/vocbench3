import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ConfigurationDefinition, Reference } from '../models/Configuration';
import { InvokableReporter, Report, ServiceInvocationDefinition } from '../models/InvokableReporter';
import { Scope } from '../models/Plugins';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class InvokableReportersServices {

    private serviceName = "InvokableReporters";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Checks if a manchester expression in valid
     * @param manchExpr manchester expression to check
     */
    compileReport(reporterReference: string, render?: boolean, includeTemplate?: boolean): Observable<Report> {
        var params = {
            reporterReference: reporterReference,
            render: render,
            includeTemplate: includeTemplate
        };
        return this.httpMgr.doGet(this.serviceName, "compileReport", params);
    }

    /**
     * 
     * @param reporterReference 
     * @param targetMimeType 
     */
    compileAndDownloadReport(reporterReference: string, targetMimeType?: string) {
        let params = {
            reporterReference: reporterReference,
            targetMimeType: targetMimeType
        }
        return this.httpMgr.downloadFile(this.serviceName, "compileAndDownloadReport", params);
    }

    getConfigurationScopes(): Observable<Scope[]> {
        let params = {}
        return this.httpMgr.doGet(this.serviceName, "getConfigurationScopes", params);
    }

    /**
     * 
     */
    getInvokableReporterIdentifiers(): Observable<Reference[]> {
        let params = {}
        return this.httpMgr.doGet(this.serviceName, "getInvokableReporterIdentifiers", params).map(
            stResp => {
                let references: Reference[] = [];
                for (let i = 0; i < stResp.length; i++) {
                    references.push(Reference.deserialize(stResp[i]));
                }
                return references;
            }
        );
    }

    /**
     * @param reference 
     */
    getInvokableReporter(reference: string): Observable<InvokableReporter> {
        var params = {
            reference: reference
        }
        return this.httpMgr.doGet(this.serviceName, "getInvokableReporter", params).map(
            stResp => {
                return <InvokableReporter>InvokableReporter.parse(stResp);
            }
        );
    }

    /**
     * 
     * @param reference 
     * @param definition 
     */
    createInvokableReporter(reference: string, definition: ConfigurationDefinition) {
        let params = {
            reference: reference,
            definition: JSON.stringify(definition)
        }
        return this.httpMgr.doPost(this.serviceName, "createInvokableReporter", params);
    }

    /**
     * 
     * @param reference 
     */
    deleteInvokableReporter(reference: string) {
        let params = {
            reference: reference,
        }
        return this.httpMgr.doPost(this.serviceName, "deleteInvokableReporter", params);
    }

    /**
     * 
     * @param reference 
     * @param definition 
     */
    updateInvokableReporter(reference: string, definition: ConfigurationDefinition) {
        let params = {
            reference: reference,
            definition: JSON.stringify(definition)
        }
        return this.httpMgr.doPost(this.serviceName, "createInvokableReporter", params);
    }

    /**
     * 
     * @param reference 
     * @param section 
     * @param index 
     */
    addSectionToReporter(reference: string, section: ServiceInvocationDefinition, index?: number) {
        let params = {
            reference: reference,
            section: JSON.stringify(section),
            index: index
        }
        return this.httpMgr.doPost(this.serviceName, "addSectionToReporter", params);
    }

    /**
     * 
     * @param reference 
     * @param section 
     * @param index 
     */
    updateSectionInReporter(reference: string, section: ServiceInvocationDefinition, index: number) {
        let params = {
            reference: reference,
            section: JSON.stringify(section),
            index: index
        }
        return this.httpMgr.doPost(this.serviceName, "updateSectionInReporter", params);
    }

    /**
     * 
     * @param reference 
     * @param index 
     */
    removeSectionFromReporter(reference: string, index: number) {
        let params = {
            reference: reference,
            index: index
        }
        return this.httpMgr.doPost(this.serviceName, "removeSectionFromReporter", params);
    }


}



