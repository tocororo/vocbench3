import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTResource, ARTURIResource } from "../models/ARTResources";
import { RDFCapabilityType } from "../models/Coda";
import { PrefixMapping } from '../models/Metadata';
import { RDFFormat } from "../models/RDFFormat";
import { Sheet2RdfDeserializer, SimpleHeader, SubjectHeader, TableRow, TriplePreview } from "../models/Sheet2RDF";
import { HttpManager, HttpServiceContext } from "../utils/HttpManager";

@Injectable()
export class Sheet2RDFServices {

    private serviceName = "Sheet2RDF";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Uploads a spreadheet
     * @param file 
     */
    uploadSpreadsheet(file: File, fsNamingStrategy?: string) {
        var data: any = {
            file: file,
            fsNamingStrategy: fsNamingStrategy
        };
        return this.httpMgr.uploadFile(this.serviceName, "uploadSpreadsheet", data);
    }

    /**
     * Returns the header structures of the uploaded spreadsheet
     */
    getHeaders(): Observable<{subject: SubjectHeader, headers: SimpleHeader[]}> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getHeaders", params).map(
            stResp => {
                let subject: SubjectHeader = Sheet2RdfDeserializer.parseSubjectHeader(stResp.subject);

                let headers: SimpleHeader[] = [];
                let headersJson = stResp.headers;
                for (var i = 0; i < headersJson.length; i++) {
                    headers.push(Sheet2RdfDeserializer.parseSimpleHeader(headersJson[i]));
                }

                return { subject: subject, headers: headers };
            }
        );
    }

    getHeaderFromId(headerId: string): Observable<SimpleHeader> {
        var params: any = {
            headerId: headerId
        };
        return this.httpMgr.doGet(this.serviceName, "getHeaderFromId", params).map(
            stResp => {
                return Sheet2RdfDeserializer.parseSimpleHeader(stResp);
            }
        );
    }

    ignoreHeader(headerId: string, ignore: boolean) {
        var params: any = {
            headerId: headerId,
            ignore: ignore
        };
        return this.httpMgr.doPost(this.serviceName, "ignoreHeader", params);
    }

    addSimpleGraphApplicationToHeader(headerId: string, property: ARTURIResource, nodeId: string, type?: ARTURIResource) {
        let params: any = {
            headerId: headerId,
            property: property,
            nodeId: nodeId,
            type: type
        };
        return this.httpMgr.doPost(this.serviceName, "addGraphApplicationToHeader", params);
    }

    addAdvancedGraphApplicationToHeader(headerId: string, graphPattern: string, nodeIds: string[]) {
        let params: any = {
            headerId: headerId,
            graphPattern: graphPattern,
            nodeIds: nodeIds
        };
        return this.httpMgr.doPost(this.serviceName, "addAdvancedGraphApplicationToHeader", params);
    }

    updateSimpleGraphApplication(headerId: string, graphId: string, property: ARTURIResource, nodeId: string, type?: ARTURIResource) {
        let params: any = {
            headerId: headerId,
            graphId: graphId,
            property: property,
            nodeId: nodeId,
            type: type
        };
        return this.httpMgr.doPost(this.serviceName, "updateSimpleGraphApplication", params);
    }
    
    updateAdvancedGraphApplication(headerId: string, graphId: string, graphPattern: string, nodeIds: string[]) {
        let params: any = {
            headerId: headerId,
            graphId: graphId,
            graphPattern: graphPattern,
            nodeIds: nodeIds
        };
        return this.httpMgr.doPost(this.serviceName, "updateAdvancedGraphApplication", params);
    }

    removeGraphApplicationFromHeader(headerId: string, graphId: string) {
        let params: any = {
            headerId: headerId,
            graphId: graphId
        };
        return this.httpMgr.doPost(this.serviceName, "removeGraphApplicationFromHeader", params);
    }

    isNodeIdAlreadyUsed(nodeId: string): Observable<boolean> {
        let params: any = {
            nodeId: nodeId
        };
        return this.httpMgr.doGet(this.serviceName, "isNodeIdAlreadyUsed", params);
    }

    addNodeToHeader(headerId: string, nodeId: string, converterCapability: RDFCapabilityType, 
        converterContract: string, converterDatatype?: ARTURIResource, converterLanguage?: string, 
        converterParams?: {[key: string]: any}, memoize?: boolean) {
        let params: any = {
            headerId: headerId,
            nodeId: nodeId,
            converterCapability: converterCapability,
            converterContract: converterContract,
            converterDatatype: converterDatatype,
            converterLanguage: converterLanguage,
            converterParams: (converterParams != null) ? this.getMapSerialization(converterParams) : null,
            memoize: memoize
        };
        return this.httpMgr.doPost(this.serviceName, "addNodeToHeader", params);
    }

    removeNodeFromHeader(headerId: string, nodeId: string) {
        let params: any = {
            headerId: headerId,
            nodeId: nodeId
        };
        return this.httpMgr.doPost(this.serviceName, "removeNodeFromHeader", params);
    }

    updateSubjectHeader(headerId: string, converterContract: string, converterParams?: {[key: string]: any}, type?: ARTURIResource, memoize?: boolean) {
        let params: any = {
            headerId: headerId,
            converterContract: converterContract,
            converterParams: (converterParams != null) ? this.getMapSerialization(converterParams) : null,
            type: type,
            memoize
        };
        return this.httpMgr.doPost(this.serviceName, "updateSubjectHeader", params);
    }

    /**
     * Returns a preview (first maxRows rows) of the spreadsheet uploaded
     * @param maxRows 
     */
    getTablePreview(maxRows: number): Observable<{returned: number, total: number, rows: TableRow[]}> {
        var params: any = {
            maxRows: maxRows,
        };
        return this.httpMgr.doGet(this.serviceName, "getTablePreview", params).map(
            stResp => {
                return stResp;
            }
        );
    }

    /**
     * Lets sheet2rdf generate the pearl and returns it
     */
    getPearl(): Observable<string> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getPearl", params).map(
            stResp => {
                return stResp;
            }
        );
    }

    /**
     * Saves the pearl code
     * @param pearlCode 
     */
    savePearl(pearlCode: string) {
        var data: any = {
            pearlCode: pearlCode
        };
        return this.httpMgr.doPost(this.serviceName, "savePearl", data);
    }

    validatePearl(pearlCode: string): Observable<{valid: boolean, details: string}> {
        var params: any = {
            pearlCode: pearlCode
        };
        return this.httpMgr.doPost(this.serviceName, "validatePearl", params);
    }

    /**
     * Uploads a file containing a pearl code to use.
     * Returns the pearl code.
     * @param file 
     */
    uploadPearl(file: File): Observable<string> {
        var data: any = {
            file: file
        };
        return this.httpMgr.uploadFile(this.serviceName, "uploadPearl", data).map(
            stResp => {
                return stResp;
            }
        );
    }

    /**
     * Returns a preview of the triples generated. The preview contains just the triples generated considering the first
     * 'maxTableRows' of the datasheet
     * @param maxTableRows 
     */
    getTriplesPreview(maxTableRows: number): Observable<{returned: number, total: number, triples: TriplePreview[]}> {
        var params: any = {
            maxTableRows: maxTableRows
        };
        return this.httpMgr.doGet(this.serviceName, "getTriplesPreview", params).map(
            stResp => {
                stResp.returned;
                return stResp;
            }
        );
    }

    addTriples() {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "addTriples", params);
    }

    exportTriples(outputFormat: RDFFormat) {
        var params: any = {
            outputFormat: outputFormat.name
        };
        return this.httpMgr.downloadFile(this.serviceName, "exportTriples", params);
    }

    getPrefixMappings() {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getPrefixMappings", params).map(
            stResp => {
                let mappings: PrefixMapping[] = [];
                for (let i = 0; i < stResp.length; i++) {
                    let m: PrefixMapping = {
                        prefix: stResp[i].prefix,
                        namespace: stResp[i].namespace,
                        explicit: stResp[i].explicit
                    };
                    mappings.push(m);
                }
                return mappings;
            }
        );
    }

    closeSession() {
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "closeSession", params).map(
            stResp => {
                HttpServiceContext.removeSessionToken();
                return stResp;
            }
        );
    }


    private getMapSerialization(map: {[key:string]: any}): string {
        let mapSerialized: { [key: string]: string } = {};
        for (let paramName in map) {
            let paramValue = map[paramName];
            if (paramValue instanceof ARTResource) {
                paramValue = paramValue.toNT();
            } else if (Array.isArray(paramValue)) { //array
                let serializedArray: string[] = [];
                paramValue.forEach(v => {
                    if (v instanceof ARTResource) {
                        serializedArray.push(v.toNT());
                    } else { //plain string
                        serializedArray.push(v);
                    }
                })
                paramValue = JSON.stringify(serializedArray);
            } else if (typeof paramValue == "object") { //object => map
                paramValue = this.getMapSerialization(paramValue);
            }
            //other cases (e.g. param value is already a string) do nothing
            mapSerialized[paramName] = paramValue;
        }
        return JSON.stringify(mapSerialized);
    }

}