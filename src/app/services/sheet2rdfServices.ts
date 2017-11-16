import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager, HttpServiceContext } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { HeaderStruct, TableRow, TriplePreview } from "../models/Sheet2RDF";
import { RDFCapabilityType } from "../models/Coda";
import { ARTURIResource } from "../models/ARTResources";
import { RDFFormat } from "../models/RDFFormat";

@Injectable()
export class Sheet2RDFServices {

    private serviceName = "Sheet2RDF";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Uploads a spreadheet
     * @param file 
     */
    uploadSpreadsheet(file: File) {
        console.log("[Sheet2RDFServices] uploadSpreadsheet");
        var data: any = {
            file: file
        };
        return this.httpMgr.uploadFile(this.serviceName, "uploadSpreadsheet", data, true);
    }

    /**
     * Returns the header structures of the uploaded spreadsheet
     */
    getHeaders(): Observable<HeaderStruct[]> {
        console.log("[Sheet2RDFServices] getHeaders");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getHeaders", params, true).map(
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
        console.log("[Sheet2RDFServices] getHeaderFromId");
        var params: any = {
            headerId: headerId
        };
        return this.httpMgr.doGet(this.serviceName, "getHeaderFromId", params, true).map(
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
            lang: json.lang,
            converter: {
                uri: json.converter.uri,
                type: json.converter.type
            },
            isMultiple: json.isMultiple
        }
        return h;
    }

    updateHeader(headerId: string, headerResource?: ARTURIResource, converterMention?: string, converterType?: RDFCapabilityType, applyToAll?: boolean) {
        console.log("[Sheet2RDFServices] updateHeader");
        var params: any = {
            headerId: headerId,
        };
        if (headerResource != null) {
            params.headerResource = headerResource;
        }
        if (converterMention != null && converterType != null) {
            params.converterMention = converterMention;
            params.converterType = converterType;
        }
        if (applyToAll != null) {
            params.applyToAll = applyToAll;
        }
        return this.httpMgr.doPost(this.serviceName, "updateHeader", params, true);
    }

    listConverters(rangeType: string, datatype?: ARTURIResource): Observable<any> {
        console.log("[Sheet2RDFServices] listConverters");
        var params: any = {};
        if (rangeType != null) {
            params.rangeType = rangeType;
        }
        if (datatype != null) {
            params.datatype = datatype;
        }
        return this.httpMgr.doGet(this.serviceName, "listConverters", params, true).map(
            stResp => {
                console.log("stResp", stResp);
                return stResp;
            }
        );
    }

    /**
     * Returns a preview (first maxRows rows) of the spreadsheet uploaded
     * @param maxRows 
     */
    getTablePreview(maxRows: number): Observable<{returned: number, total: number, rows: TableRow[]}> {
        console.log("[Sheet2RDFServices] getTablePreview");
        var params: any = {
            maxRows: maxRows,
        };
        return this.httpMgr.doGet(this.serviceName, "getTablePreview", params, true).map(
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
        console.log("[Sheet2RDFServices] getPearl");
        var params: any = {};
        if (skosSchema != null) {
            params.skosSchema = skosSchema;
        }
        return this.httpMgr.doGet(this.serviceName, "getPearl", params, true).map(
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
        console.log("[Sheet2RDFServices] savePearl");
        var data: any = {
            pearlCode: pearlCode
        };
        return this.httpMgr.doPost(this.serviceName, "savePearl", data, true);
    }

    validatePearl(pearlCode: string): Observable<{valid: boolean, details: string}> {
        console.log("[Sheet2RDFServices] validatePearl");
        var params: any = {
            pearlCode: pearlCode
        };
        return this.httpMgr.doPost(this.serviceName, "validatePearl", params, true);
    }

    /**
     * Uploads a file containing a pearl code to use.
     * Returns the pearl code.
     * @param file 
     */
    uploadPearl(file: File): Observable<string> {
        console.log("[Sheet2RDFServices] uploadPearl");
        var data: any = {
            file: file
        };
        return this.httpMgr.uploadFile(this.serviceName, "uploadPearl", data, true).map(
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
        console.log("[Sheet2RDFServices] getTriplesPreview");
        var params: any = {
            maxTableRows: maxTableRows
        };
        return this.httpMgr.doGet(this.serviceName, "getTriplesPreview", params, true).map(
            stResp => {
                stResp.returned;
                return stResp;
            }
        );
    }

    addTriples() {

    }

    exportTriples(outputFormat: RDFFormat) {
        console.log("[Sheet2RDFServices] exportTriples");
        var params: any = {
            outputFormat: outputFormat.name
        };
        return this.httpMgr.downloadFile(this.serviceName, "exportTriples", params);
    }

    closeSession() {
        console.log("[Sheet2RDFServices] closeSession");
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "closeSession", params, true).map(
            stResp => {
                HttpServiceContext.removeSessionToken();
                return stResp;
            }
        );
    }

}