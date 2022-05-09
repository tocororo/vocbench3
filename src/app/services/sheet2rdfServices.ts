import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { ARTNode, ARTResource, ARTURIResource } from "../models/ARTResources";
import { RDFCapabilityType } from "../models/Coda";
import { Configuration, Reference } from '../models/Configuration';
import { PrefixMapping } from '../models/Metadata';
import { RDFFormat } from "../models/RDFFormat";
import { Pair } from '../models/Shared';
import { S2RDFModel, Sheet2RdfDeserializer, SimpleGraphApplication, SimpleHeader, SubjectHeader, TableRow, TriplePreview } from "../models/Sheet2RDF";
import { HttpManager, HttpServiceContext, STRequestParams, VBRequestOptions } from "../utils/HttpManager";
import { ResourcesServices } from './resourcesServices';

@Injectable()
export class Sheet2RDFServices {

    private serviceName = "Sheet2RDF";

    constructor(private httpMgr: HttpManager, private resourcesService: ResourcesServices) { }

    /**
     * Uploads a spreadheet
     * @param file 
     */
    uploadSpreadsheet(file: File, fsNamingStrategy?: string) {
        let data: STRequestParams = {
            file: file,
            fsNamingStrategy: fsNamingStrategy
        };
        return this.httpMgr.uploadFile(this.serviceName, "uploadSpreadsheet", data);
    }

    uploadDBInfo(db_base_url: string, db_name: string, db_tableList: string[], db_user: string, db_password: string, db_driverName: string, fsNamingStrategy?: string) {
        let data: STRequestParams = {
            db_base_url: db_base_url,
            db_name: db_name,
            db_tableList: db_tableList,
            db_user: db_user,
            db_password: db_password,
            db_driverName: db_driverName,
            fsNamingStrategy: fsNamingStrategy
        };
        let options: VBRequestOptions = new VBRequestOptions({
            errorHandlers: [{
                className: "it.uniroma2.art.sheet2rdf.exception.DBLocalizedException", action: 'warning'
            }]
        });
        return this.httpMgr.doPost(this.serviceName, "uploadDBInfo", data, options);
    }

    getSupportedDBDrivers(): Observable<string[]> {
        let params: STRequestParams = {};
        return this.httpMgr.doGet(this.serviceName, "getSupportedDBDrivers", params);
    }

    listSheetNames(): Observable<string[]> {
        let params: STRequestParams = {};
        return this.httpMgr.doGet(this.serviceName, "listSheetNames", params);
    }

    /**
     * Returns the header structures of the given sheet
     */
    getSheetHeaders(sheetName: string): Observable<S2RDFModel> {
        let params: STRequestParams = {
            sheetName: sheetName
        };
        return this.httpMgr.doGet(this.serviceName, "getSheetHeaders", params).pipe(
            mergeMap(stResp => {
                let subject: SubjectHeader = Sheet2RdfDeserializer.parseSubjectHeader(stResp.subject);
                let headers: SimpleHeader[] = [];
                let headersJson = stResp.headers;
                for (let i = 0; i < headersJson.length; i++) {
                    headers.push(Sheet2RdfDeserializer.parseSimpleHeader(headersJson[i]));
                }
                //annotate the type of the subject mapping (do not annotate the properties of the headers, they will be annotated individually when editing the single header)
                if (subject.graph.type != null) {
                    return this.resourcesService.getResourceDescription(subject.graph.type).pipe(
                        map(annotatedRes => {
                            subject.graph.type = <ARTURIResource>annotatedRes;
                            return { subjectHeader: subject, headers: headers };
                        })
                    );
                } else {
                    return of({ subjectHeader: subject, headers: headers });
                }
            })
        );
    }

    getHeaderFromId(sheetName: string, headerId: string): Observable<SimpleHeader> {
        let params: STRequestParams = {
            sheetName: sheetName,
            headerId: headerId
        };
        return this.httpMgr.doGet(this.serviceName, "getHeaderFromId", params).pipe(
            mergeMap(stResp => {
                let header: SimpleHeader = Sheet2RdfDeserializer.parseSimpleHeader(stResp);
                //collect the URI resources: properties and types
                let resources: ARTURIResource[] = [];
                header.graph.forEach(g => {
                    if (g instanceof SimpleGraphApplication) {
                        if (g.property != null) {
                            resources.push(g.property);
                        }
                        if (g.value != null) {
                            resources.push(<ARTURIResource>g.value);
                        }
                    }
                });
                //replace
                if (resources.length > 0) {
                    return this.resourcesService.getResourcesInfo(resources).pipe(
                        map(annotatedRes => {
                            annotatedRes.forEach(ar => {
                                header.graph.forEach(g => {
                                    if (g instanceof SimpleGraphApplication) {
                                        if (g.property != null && g.property.equals(ar)) {
                                            g.property = <ARTURIResource>ar;
                                        }
                                        if (g.value != null && g.value.equals(ar)) {
                                            g.value = ar;
                                        }
                                    }
                                });
                            });
                            return header;
                        })
                    );
                } else {
                    return of(header);
                }

            })
        );
    }

    ignoreHeader(sheetName: string, headerId: string, ignore: boolean) {
        let params: STRequestParams = {
            sheetName: sheetName,
            headerId: headerId,
            ignore: ignore
        };
        return this.httpMgr.doPost(this.serviceName, "ignoreHeader", params);
    }

    addSimpleGraphApplicationToHeader(sheetName: string, headerId: string, property: ARTURIResource, nodeId: string, type?: ARTResource) {
        let params: STRequestParams = {
            sheetName: sheetName,
            headerId: headerId,
            property: property,
            nodeId: nodeId,
            type: type
        };
        return this.httpMgr.doPost(this.serviceName, "addSimpleGraphApplicationToHeader", params);
    }

    addAdvancedGraphApplicationToHeader(sheetName: string, headerId: string, graphPattern: string, nodeIds: string[], prefixMapping: { [key: string]: string }, defaultPredicate?: ARTURIResource) {
        let params: STRequestParams = {
            sheetName: sheetName,
            headerId: headerId,
            graphPattern: graphPattern,
            nodeIds: nodeIds,
            prefixMapping: JSON.stringify(prefixMapping),
            defaultPredicate: defaultPredicate
        };
        return this.httpMgr.doPost(this.serviceName, "addAdvancedGraphApplicationToHeader", params);
    }

    updateSimpleGraphApplication(sheetName: string, headerId: string, graphId: string, property: ARTURIResource, nodeId: string, type?: ARTResource) {
        let params: STRequestParams = {
            sheetName: sheetName,
            headerId: headerId,
            graphId: graphId,
            property: property,
            nodeId: nodeId,
            type: type
        };
        return this.httpMgr.doPost(this.serviceName, "updateSimpleGraphApplication", params);
    }

    updateAdvancedGraphApplication(sheetName: string, headerId: string, graphId: string, graphPattern: string, nodeIds: string[], prefixMapping: { [key: string]: string }, defaultPredicate?: ARTURIResource) {
        let params: STRequestParams = {
            sheetName: sheetName,
            headerId: headerId,
            graphId: graphId,
            graphPattern: graphPattern,
            nodeIds: nodeIds,
            prefixMapping: JSON.stringify(prefixMapping),
            defaultPredicate: defaultPredicate
        };
        return this.httpMgr.doPost(this.serviceName, "updateAdvancedGraphApplication", params);
    }

    updateGraphApplicationDelete(sheetName: string, headerId: string, graphId: string, deleteEnabled: boolean) {
        let params: STRequestParams = {
            sheetName: sheetName,
            headerId: headerId,
            graphId: graphId,
            delete: deleteEnabled,
        };
        return this.httpMgr.doPost(this.serviceName, "updateGraphApplicationDelete", params);
    }

    removeGraphApplicationFromHeader(sheetName: string, headerId: string, graphId: string) {
        let params: STRequestParams = {
            sheetName: sheetName,
            headerId: headerId,
            graphId: graphId
        };
        return this.httpMgr.doPost(this.serviceName, "removeGraphApplicationFromHeader", params);
    }

    isNodeIdAlreadyUsed(sheetName: string, nodeId: string): Observable<boolean> {
        let params: STRequestParams = {
            sheetName: sheetName,
            nodeId: nodeId
        };
        return this.httpMgr.doGet(this.serviceName, "isNodeIdAlreadyUsed", params);
    }

    addNodeToHeader(sheetName: string, headerId: string, nodeId: string, converterCapability: RDFCapabilityType,
        converterContract: string, converterDatatypeUri?: string, converterLanguage?: string,
        converterParams?: { [key: string]: any }, memoize?: boolean, memoizeId?: string) {
        let params: STRequestParams = {
            sheetName: sheetName,
            headerId: headerId,
            nodeId: nodeId,
            converterCapability: converterCapability,
            converterContract: converterContract,
            converterDatatypeUri: converterDatatypeUri,
            converterLanguage: converterLanguage,
            converterParams: (converterParams != null) ? this.getMapSerialization(converterParams) : null,
            memoize: memoize,
            memoizeId: memoizeId
        };
        return this.httpMgr.doPost(this.serviceName, "addNodeToHeader", params);
    }

    updateNodeInHeader(sheetName: string, headerId: string, nodeId: string, converterCapability: RDFCapabilityType,
        converterContract: string, converterDatatypeUri?: string, converterLanguage?: string,
        converterParams?: { [key: string]: any }, memoize?: boolean, memoizeId?: string) {
        let params: STRequestParams = {
            sheetName: sheetName,
            headerId: headerId,
            nodeId: nodeId,
            converterCapability: converterCapability,
            converterContract: converterContract,
            converterDatatypeUri: converterDatatypeUri,
            converterLanguage: converterLanguage,
            converterParams: (converterParams != null) ? this.getMapSerialization(converterParams) : null,
            memoize: memoize,
            memoizeId: memoizeId
        };
        return this.httpMgr.doPost(this.serviceName, "updateNodeInHeader", params);
    }

    renameNodeId(sheetName: string, headerId: string, nodeId: string, newNodeId: string) {
        let params: STRequestParams = {
            sheetName: sheetName,
            headerId: headerId,
            nodeId: nodeId,
            newNodeId: newNodeId
        };
        return this.httpMgr.doPost(this.serviceName, "renameNodeId", params);
    }

    removeNodeFromHeader(sheetName: string, headerId: string, nodeId: string) {
        let params: STRequestParams = {
            sheetName: sheetName,
            headerId: headerId,
            nodeId: nodeId
        };
        return this.httpMgr.doPost(this.serviceName, "removeNodeFromHeader", params);
    }

    updateSubjectHeader(sheetName: string, headerId: string, converterContract: string, converterParams?: { [key: string]: any }, type?: ARTResource,
        additionalPredObjs?: Pair<ARTURIResource, ARTNode>[], memoize?: boolean, memoizeId?: string) {
        let params: STRequestParams = {
            sheetName: sheetName,
            headerId: headerId,
            converterContract: converterContract,
            converterParams: (converterParams != null) ? this.getMapSerialization(converterParams) : null,
            type: type,
            memoize: memoize,
            memoizeId: memoizeId,
            additionalPredObjs: additionalPredObjs != null ? JSON.stringify(additionalPredObjs.map(p => [p.first.toNT(), p.second.toNT()])) : null,
        };
        return this.httpMgr.doPost(this.serviceName, "updateSubjectHeader", params);
    }

    updateSubjectHeaderAdditionalGraph(sheetName: string, predicate: ARTURIResource, object: ARTNode) {
        let params: STRequestParams = {
            sheetName: sheetName,
            predicate: predicate,
            object: object
        };
        return this.httpMgr.doPost(this.serviceName, "updateSubjectHeaderAdditionalGraph", params);
    }

    replicateMultipleHeader(sheetName: string, headerId: string) {
        let params: STRequestParams = {
            sheetName: sheetName,
            headerId: headerId,
        };
        return this.httpMgr.doPost(this.serviceName, "replicateMultipleHeader", params);
    }

    exportSheetStatus(sheetName: string) {
        let params: STRequestParams = {
            sheetName: sheetName,
        };
        return this.httpMgr.downloadFile(this.serviceName, "exportSheetStatus", params);
    }

    importSheetStatus(sheetName: string, statusFile: File) {
        let data: STRequestParams = {
            sheetName: sheetName,
            statusFile: statusFile
        };
        return this.httpMgr.uploadFile(this.serviceName, "importSheetStatus", data);
    }

    exportGlobalStatus() {
        let params: STRequestParams = {};
        return this.httpMgr.downloadFile(this.serviceName, "exportGlobalStatus", params);
    }

    importGlobalStatus(statusFile: File) {
        let data: STRequestParams = {
            statusFile: statusFile
        };
        return this.httpMgr.uploadFile(this.serviceName, "importGlobalStatus", data);
    }

    /**
     * Returns a preview (first maxRows rows) of the spreadsheet uploaded
     * @param maxRows 
     */
    getTablePreview(sheetName: string, maxRows: number): Observable<{ returned: number, total: number, rows: TableRow[] }> {
        let params: STRequestParams = {
            sheetName: sheetName,
            maxRows: maxRows,
        };
        return this.httpMgr.doGet(this.serviceName, "getTablePreview", params);
    }

    /**
     * Lets sheet2rdf generate the pearl and returns it
     */
    getPearl(sheetName: string): Observable<string> {
        let params: STRequestParams = {
            sheetName: sheetName
        };
        return this.httpMgr.doGet(this.serviceName, "getPearl", params);
    }

    /**
     * Saves the pearl code
     * @param pearlCode 
     */
    savePearl(sheetName: string, pearlCode: string) {
        let data: any = {
            sheetName: sheetName,
            pearlCode: pearlCode
        };
        return this.httpMgr.doPost(this.serviceName, "savePearl", data);
    }

    validateGraphPattern(pearlCode: string): Observable<{ valid: boolean, details: string, usedNodes: string[], usedPrefixes: string[] }> {
        let params: STRequestParams = {
            pearlCode: pearlCode
        };
        return this.httpMgr.doPost(this.serviceName, "validateGraphPattern", params);
    }

    /**
     * Uploads a file containing a pearl code to use.
     * Returns the pearl code.
     * @param file 
     */
    uploadPearl(sheetName: string, file: File): Observable<string> {
        let data: any = {
            sheetName: sheetName,
            file: file
        };
        return this.httpMgr.uploadFile(this.serviceName, "uploadPearl", data);
    }

    /**
     * Returns a preview of the triples generated. The preview contains just the triples generated considering the first
     * 'maxTableRows' of the datasheet
     * @param maxTableRows 
     */
    getTriplesPreview(sheetName: string, maxTableRows: number): Observable<{ returned: number, total: number, triples: TriplePreview[] }> {
        let params: STRequestParams = {
            sheetName: sheetName,
            maxTableRows: maxTableRows
        };
        return this.httpMgr.doGet(this.serviceName, "getTriplesPreview", params);
    }

    addTriples(sheetName: string) {
        let params: STRequestParams = {
            sheetName: sheetName
        };
        return this.httpMgr.doGet(this.serviceName, "addTriples", params);
    }

    exportTriples(sheetName: string, outputFormat: RDFFormat) {
        let params: STRequestParams = {
            sheetName: sheetName,
            outputFormat: outputFormat.name
        };
        return this.httpMgr.downloadFile(this.serviceName, "exportTriples", params);
    }

    getPrefixMappings() {
        let params: STRequestParams = {};
        return this.httpMgr.doGet(this.serviceName, "getPrefixMappings", params).pipe(
            map(stResp => {
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
            })
        );
    }

    getDefaultAdvancedGraphApplicationConfigurations(): Observable<Reference[]> {
        let params: STRequestParams = {};
        return this.httpMgr.doGet(this.serviceName, "getDefaultAdvancedGraphApplicationConfigurations", params).pipe(
            map(stResp => {
                let references: Reference[] = [];
                for (let i = 0; i < stResp.length; i++) {
                    references.push(Reference.deserialize(stResp[i]));
                }
                return references;
            })
        );
    }

    getConfiguration(identifier: string): Observable<Configuration> {
        let params = {
            identifier: identifier
        };
        return this.httpMgr.doGet(this.serviceName, "getConfiguration", params).pipe(
            map(stResp => {
                return Configuration.parse(stResp);
            })
        );
    }

    closeSession() {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "closeSession", params).pipe(
            map(stResp => {
                HttpServiceContext.removeSessionToken();
                return stResp;
            })
        );
    }


    private getMapSerialization(map: { [key: string]: any }): string {
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
                });
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