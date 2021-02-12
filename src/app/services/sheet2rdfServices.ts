import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { ARTNode, ARTResource, ARTURIResource } from "../models/ARTResources";
import { RDFCapabilityType } from "../models/Coda";
import { Configuration, Reference } from '../models/Configuration';
import { PrefixMapping } from '../models/Metadata';
import { RDFFormat } from "../models/RDFFormat";
import { Pair } from '../models/Shared';
import { Sheet2RdfDeserializer, SimpleGraphApplication, SimpleHeader, SubjectHeader, TableRow, TriplePreview } from "../models/Sheet2RDF";
import { HttpManager, HttpServiceContext } from "../utils/HttpManager";
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
        return this.httpMgr.doGet(this.serviceName, "getHeaders", params).pipe(
            mergeMap(stResp => {
                let subject: SubjectHeader = Sheet2RdfDeserializer.parseSubjectHeader(stResp.subject);
                let headers: SimpleHeader[] = [];
                let headersJson = stResp.headers;
                for (var i = 0; i < headersJson.length; i++) {
                    headers.push(Sheet2RdfDeserializer.parseSimpleHeader(headersJson[i]));
                }
                //annotate the type of the subject mapping (do not annotate the properties of the headers, they will be annotated individually when editing the single header)
                if (subject.graph.type != null) {
                    return this.resourcesService.getResourceDescription(subject.graph.type).pipe(
                        map(annotatedRes => {
                            subject.graph.type = <ARTURIResource>annotatedRes;
                            return { subject: subject, headers: headers };
                        })
                    );
                } else {
                    return of({ subject: subject, headers: headers });
                }
            })
        );
    }

    getHeaderFromId(headerId: string): Observable<SimpleHeader> {
        var params: any = {
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

    ignoreHeader(headerId: string, ignore: boolean) {
        var params: any = {
            headerId: headerId,
            ignore: ignore
        };
        return this.httpMgr.doPost(this.serviceName, "ignoreHeader", params);
    }

    addSimpleGraphApplicationToHeader(headerId: string, property: ARTURIResource, nodeId: string, type?: ARTResource) {
        let params: any = {
            headerId: headerId,
            property: property,
            nodeId: nodeId,
            type: type
        };
        return this.httpMgr.doPost(this.serviceName, "addSimpleGraphApplicationToHeader", params);
    }

    addAdvancedGraphApplicationToHeader(headerId: string, graphPattern: string, nodeIds: string[], prefixMapping: {[key: string]: string}, defaultPredicate?: ARTURIResource) {
        let params: any = {
            headerId: headerId,
            graphPattern: graphPattern,
            nodeIds: nodeIds,
            prefixMapping: JSON.stringify(prefixMapping),
            defaultPredicate: defaultPredicate
        };
        return this.httpMgr.doPost(this.serviceName, "addAdvancedGraphApplicationToHeader", params);
    }

    updateSimpleGraphApplication(headerId: string, graphId: string, property: ARTURIResource, nodeId: string, type?: ARTResource) {
        let params: any = {
            headerId: headerId,
            graphId: graphId,
            property: property,
            nodeId: nodeId,
            type: type
        };
        return this.httpMgr.doPost(this.serviceName, "updateSimpleGraphApplication", params);
    }
    
    updateAdvancedGraphApplication(headerId: string, graphId: string, graphPattern: string, nodeIds: string[], prefixMapping: {[key: string]: string}, defaultPredicate?: ARTURIResource) {
        let params: any = {
            headerId: headerId,
            graphId: graphId,
            graphPattern: graphPattern,
            nodeIds: nodeIds,
            prefixMapping: JSON.stringify(prefixMapping),
            defaultPredicate: defaultPredicate
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
        converterContract: string, converterDatatypeUri?: string, converterLanguage?: string, 
        converterParams?: {[key: string]: any}, memoize?: boolean) {
        let params: any = {
            headerId: headerId,
            nodeId: nodeId,
            converterCapability: converterCapability,
            converterContract: converterContract,
            converterDatatypeUri: converterDatatypeUri,
            converterLanguage: converterLanguage,
            converterParams: (converterParams != null) ? this.getMapSerialization(converterParams) : null,
            memoize: memoize
        };
        return this.httpMgr.doPost(this.serviceName, "addNodeToHeader", params);
    }

    updateNodeInHeader(headerId: string, nodeId: string, converterCapability: RDFCapabilityType, 
        converterContract: string, converterDatatypeUri?: string, converterLanguage?: string, 
        converterParams?: {[key: string]: any}, memoize?: boolean) {
        let params: any = {
            headerId: headerId,
            nodeId: nodeId,
            converterCapability: converterCapability,
            converterContract: converterContract,
            converterDatatypeUri: converterDatatypeUri,
            converterLanguage: converterLanguage,
            converterParams: (converterParams != null) ? this.getMapSerialization(converterParams) : null,
            memoize: memoize
        };
        return this.httpMgr.doPost(this.serviceName, "updateNodeInHeader", params);
    }

    renameNodeId(headerId: string, nodeId: string, newNodeId: String) {
        let params: any = {
            headerId: headerId,
            nodeId: nodeId,
            newNodeId: newNodeId
        }
        return this.httpMgr.doPost(this.serviceName, "renameNodeId", params);
    }

    removeNodeFromHeader(headerId: string, nodeId: string) {
        let params: any = {
            headerId: headerId,
            nodeId: nodeId
        };
        return this.httpMgr.doPost(this.serviceName, "removeNodeFromHeader", params);
    }

    updateSubjectHeader(headerId: string, converterContract: string, converterParams?: {[key: string]: any}, type?: ARTResource, additionalPredObjs?: Pair<ARTURIResource, ARTNode>[], memoize?: boolean) {
        let params: any = {
            headerId: headerId,
            converterContract: converterContract,
            converterParams: (converterParams != null) ? this.getMapSerialization(converterParams) : null,
            type: type,
            memoize: memoize,
            additionalPredObjs: additionalPredObjs != null ? JSON.stringify(additionalPredObjs.map(p => [p.first.toNT(), p.second.toNT()])) : null,
        };
        return this.httpMgr.doPost(this.serviceName, "updateSubjectHeader", params);
    }

    updateSubjectHeaderAdditionalGraph(predicate: ARTURIResource, object: ARTNode) {
        let params: any = {
            predicate: predicate,
            object: object
        };
        return this.httpMgr.doPost(this.serviceName, "updateSubjectHeaderAdditionalGraph", params);
    }

    replicateMultipleHeader(headerId: string) {
        let params: any = {
            headerId: headerId,
        };
        return this.httpMgr.doPost(this.serviceName, "replicateMultipleHeader", params);
    }

    exportStatus() {
        var params: any = {};
        return this.httpMgr.downloadFile(this.serviceName, "exportStatus", params);
    }

    importStatus(statusFile: File) {
        var data: any = {
            statusFile: statusFile
        };
        return this.httpMgr.uploadFile(this.serviceName, "importStatus", data);
    }

    /**
     * Returns a preview (first maxRows rows) of the spreadsheet uploaded
     * @param maxRows 
     */
    getTablePreview(maxRows: number): Observable<{returned: number, total: number, rows: TableRow[]}> {
        var params: any = {
            maxRows: maxRows,
        };
        return this.httpMgr.doGet(this.serviceName, "getTablePreview", params);
    }

    /**
     * Lets sheet2rdf generate the pearl and returns it
     */
    getPearl(): Observable<string> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getPearl", params);
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

    validateGraphPattern(pearlCode: string): Observable<{valid: boolean, details: string, usedNodes: string[], usedPrefixes: string[]}> {
        var params: any = {
            pearlCode: pearlCode
        };
        return this.httpMgr.doPost(this.serviceName, "validateGraphPattern", params);
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
        return this.httpMgr.uploadFile(this.serviceName, "uploadPearl", data);
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
        return this.httpMgr.doGet(this.serviceName, "getTriplesPreview", params).pipe(
            map(stResp => {
                stResp.returned;
                return stResp;
            })
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
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getDefaultAdvancedGraphApplicationConfigurations", params).pipe(
            map(stResp => {
                let references: Reference[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    references.push(Reference.deserialize(stResp[i]));
                }
                return references;
            })
        );
    }

    getConfiguration(identifier: string): Observable<Configuration> {
        var params = {
            identifier: identifier
        };
        return this.httpMgr.doGet(this.serviceName, "getConfiguration", params).pipe(
            map(stResp => {
                return Configuration.parse(stResp);
            })
        );
    }

    closeSession() {
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "closeSession", params).pipe(
            map(stResp => {
                HttpServiceContext.removeSessionToken();
                return stResp;
            })
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