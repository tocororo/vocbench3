import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTURIResource, RDFTypesEnum } from "../models/ARTResources";
import { RDFCapabilityType, XRole } from "../models/Coda";
import { RDFFormat } from "../models/RDFFormat";
import { HeaderStruct, TableRow, TriplePreview } from "../models/Sheet2RDF";
import { Deserializer } from "../utils/Deserializer";
import { HttpManager, HttpServiceContext } from "../utils/HttpManager";

@Injectable()
export class Sheet2RDFServices {

    private serviceName = "Sheet2RDF";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Uploads a spreadheet
     * @param file 
     */
    uploadSpreadsheet(file: File) {
        var data: any = {
            file: file
        };
        return this.httpMgr.uploadFile(this.serviceName, "uploadSpreadsheet", data);
    }

    /**
     * Returns the header structures of the uploaded spreadsheet
     */
    getHeaders(): Observable<HeaderStruct[]> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getHeaders", params).map(
            stResp => {
                let headers: HeaderStruct[] = [];                
                for (var i = 0; i < stResp.length; i++) {
                    headers.push(this.parseHeaderStruct(stResp[i]));
                }
                return headers;
            }
        );
    }

    getHeaderFromId(headerId: string): Observable<HeaderStruct> {
        var params: any = {
            headerId: headerId
        };
        return this.httpMgr.doGet(this.serviceName, "getHeaderFromId", params).map(
            stResp => {
                return this.parseHeaderStruct(stResp);
            }
        );
    }

    private parseHeaderStruct(json: any): HeaderStruct {
        let h: HeaderStruct = {
            id: json.id,
            name: json.name,
            resource: (json.resource) ? Deserializer.createURI(json.resource) : null,
            converter: {
                uri: json.converter.uri,
                type: json.converter.type,
                xRole: json.converter.xRole,
                memoize: json.converter.memoize
            },
            isMultiple: json.isMultiple,

            range: {
                type: json.range.type,
                resource: (json.range.resource) ? Deserializer.createURI(json.range.resource) : null,
                lang: json.range.lang
            }
        }
        return h;
    }

    updateHeader(headerId: string, headerResource: ARTURIResource, rangeType?: RDFTypesEnum, rangeClass?: ARTURIResource,
        lang?: string, rangeDatatype?: ARTURIResource, converterMention?: string, converterType?: RDFCapabilityType, converterXRole?: XRole, 
        memoize?: boolean, applyToAll?: boolean) {
        var params: any = {
            headerId: headerId,
            headerResource: headerResource
        };
        if (rangeType != null) {
            params.rangeType = rangeType;
        }
        if (rangeClass != null) {
            params.rangeClass = rangeClass;
        }
        if (lang != null) {
            params.lang = lang;
        }
        if (rangeDatatype != null) {
            params.rangeDatatype = rangeDatatype;
        }
        if (converterMention != null && converterType != null) {
            params.converterMention = converterMention;
            params.converterType = converterType;
            params.memoize = memoize;
            if (converterXRole != null) {
                params.converterXRole = converterXRole;
            }
        }
        if (applyToAll != null) {
            params.applyToAll = applyToAll;
        }
        return this.httpMgr.doPost(this.serviceName, "updateHeader", params);
    }

    listConverters(rangeType: string, datatype?: ARTURIResource): Observable<any> {
        var params: any = {};
        if (rangeType != null) {
            params.rangeType = rangeType;
        }
        if (datatype != null) {
            params.datatype = datatype;
        }
        return this.httpMgr.doGet(this.serviceName, "listConverters", params).map(
            stResp => {
                return stResp;
            }
        );
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
     * @param skosSchema 
     */
    getPearl(skosSchema?: ARTURIResource): Observable<string> {
        var params: any = {};
        if (skosSchema != null) {
            params.skosSchema = skosSchema;
        }
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

    closeSession() {
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "closeSession", params).map(
            stResp => {
                HttpServiceContext.removeSessionToken();
                return stResp;
            }
        );
    }

}