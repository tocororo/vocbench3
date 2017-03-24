import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { VBEventHandler } from "../utils/VBEventHandler";
import { ARTURIResource } from "../models/ARTResources";
import { PrefixMapping } from "../models/PrefixMapping";
import { RDFFormat } from "../models/RDFFormat";

@Injectable()
export class MetadataServices {

    private serviceName = "Metadata";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    /**
     * Gets prefix mapping of the currently open project.
     * Returns an array of object with
     * "explicit" (tells if the mapping is explicited by the user or set by default),
     * "namespace" the namespace uri
     * "prefix" the prefix
     */
    getNamespaceMappings(): Observable<PrefixMapping[]> {
        console.log("[MetadataServices] getNamespaceMappings");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getNamespaceMappings", params, this.oldTypeService, true).map(
            stResp => {
                var mappings: PrefixMapping[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    var m: PrefixMapping = {
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

    /**
     * Adds a prefix namespace mapping
     * @param prefix
     * @param namespace
     */
    setNSPrefixMapping(prefix: string, namespace: string) {
        console.log("[MetadataServices] setNSPrefixMapping");
        var params = {
            prefix: prefix,
            namespace: namespace
        };
        return this.httpMgr.doPost(this.serviceName, "setNSPrefixMapping", params, this.oldTypeService, true);
    }

    /**
     * Removes a prefix namespace mapping
     * @param namespace
     */
    removeNSPrefixMapping(namespace: string) {
        console.log("[MetadataServices] removeNSPrefixMapping");
        var params = {
            namespace: namespace
        };
        return this.httpMgr.doPost(this.serviceName, "removeNSPrefixMapping", params, this.oldTypeService, true);
    }

    /**
     * Changes the prefix of a prefix namespace mapping
     * @param prefix
     * @param namespace
     */
    changeNSPrefixMapping(prefix: string, namespace: string) {
        console.log("[MetadataServices] changeNSPrefixMapping");
        var params = {
            prefix: prefix,
            namespace: namespace
        };
        return this.httpMgr.doPost(this.serviceName, "changeNSPrefixMapping", params, this.oldTypeService, true);
    }

    /**
     * Get imported ontology.
     * Returns an array of imports, object with:
     * "status": availble values: "FAILED", "OK"
     * "@id": the uri of the ontology
     * "imports": array of recursive imports
     */
    getImports(): Observable<{ id: string, status: string, imports: any[] }[]> {
        console.log("[MetadataServices] getImports");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getImports", params, this.oldTypeService, true).map(
            stResp => {
                var importedOntologies: any[] = [];

                for (var i = 0; i < stResp.length; i++) {
                    importedOntologies.push(this.parseImport(stResp[i]));
                }
                return importedOntologies;
            }
        );
    }

    private parseImport(importNode: any): { id: string, status: string, imports: any[] } {
        var id = importNode['@id'];
        var status = importNode.status;
        var imports: any[] = [];
        if (importNode.imports != null) {
            for (var i = 0; i < importNode.imports.length; i++) {
                imports.push(this.parseImport(importNode.imports[i]));
            }
        }
        return { id: id, status: status, imports: imports };
    }

    /**
     * Removes an imported ontology
     * @param baseURI the baseURI that identifies the imported ontology
     */
    removeImport(baseURI: string) {
        console.log("[MetadataServices] removeImport");
        var params: any = {
            baseURI: baseURI
        };
        return this.httpMgr.doPost(this.serviceName, "removeImport", params, this.oldTypeService, true).map(
            stResp => {
                this.eventHandler.refreshDataBroadcastEvent.emit();
                return stResp;
            }
        );
    }

    /**
     * Adds ontology importing it from web. Every time the project is open, the ontology is reimported from web.
     * @param baseURI baseURI of the ontology to import (url of the rdf file works as well)
     * @param altURL alternative URL (???)
     * @param rdfFormat force the format to read the ontology file to import
     */
    addFromWeb(baseURI: string, transitiveImportAllowance: string, altURL?: string, rdfFormat?: RDFFormat) {
        console.log("[MetadataServices] addFromWeb");
        var params: any = {
            baseURI: baseURI,
            transitiveImportAllowance: transitiveImportAllowance
        };
        if (altURL != undefined) {
            params.alturl = altURL;
        }
        if (rdfFormat != undefined) {
            params.rdfFormat = rdfFormat.name;
        }
        return this.httpMgr.doPost(this.serviceName, "addFromWeb", params, this.oldTypeService, true).map(
            stResp => {
                this.eventHandler.refreshDataBroadcastEvent.emit();
                return stResp;
            }
        );
    }

    /**
     * Adds ontology importing it from web and keep a copy of that in a mirror file.
     * @param baseURI baseURI of the ontology to import (url of the rdf file works as well)
     * @param mirrorFile the name of the mirror file
     * @param altURL alternative URL (???)
     * @param rdfFormat force the format to read the ontology file to import
     */
    addFromWebToMirror(baseURI: string, mirrorFile: string, transitiveImportAllowance: string, altURL?: string, rdfFormat?: RDFFormat) {
        console.log("[MetadataServices] addFromWebToMirror");
        var params: any = {
            baseURI: baseURI,
            mirrorFile: mirrorFile,
            transitiveImportAllowance: transitiveImportAllowance
        };
        if (altURL != undefined) {
            params.alturl = altURL;
        }
        if (rdfFormat != undefined) {
            params.rdfFormat = rdfFormat.name;
        }
        return this.httpMgr.doPost(this.serviceName, "addFromWebToMirror", params, this.oldTypeService, true).map(
            stResp => {
                this.eventHandler.refreshDataBroadcastEvent.emit();
                return stResp;
            }
        );
    }

    /**
    * Adds ontology importing it from a local file and keep a copy of that in a mirror file.
    * @param baseURI baseURI of the ontology to import
    * @param localFile the file from the local filesystem to import
    * @param mirrorFile the name of the mirror file
    * @param transitiveImportAllowance available values 'web' | 'webFallbackToMirror' | 'mirrorFallbackToWeb' | 'mirror'
    */
    addFromLocalFile(baseURI: string, localFile: File, mirrorFile: string, transitiveImportAllowance: string) {
        console.log("[MetadataServices] addFromLocalFile");
        var data = {
            baseURI: baseURI,
            localFile: localFile,
            mirrorFile: mirrorFile,
            transitiveImportAllowance: transitiveImportAllowance
        };
        return this.httpMgr.uploadFile(this.serviceName, "addFromLocalFile", data, this.oldTypeService, true).map(
            stResp => {
                this.eventHandler.refreshDataBroadcastEvent.emit();
                return stResp;
            }
        );
    }

    /**
     * Adds ontology importing it from a mirror file.
     * @param baseURI baseURI of the ontology to import
     * @param mirrorFile the name of the mirror file
     * @param transitiveImportAllowance available values 'web' | 'webFallbackToMirror' | 'mirrorFallbackToWeb' | 'mirror'
     */
    addFromMirror(baseURI: string, mirrorFile: string, transitiveImportAllowance: string) {
        console.log("[MetadataServices] addFromMirror");
        var params = {
            baseURI: baseURI,
            mirrorFile: mirrorFile,
            transitiveImportAllowance: transitiveImportAllowance
        };
        return this.httpMgr.doPost(this.serviceName, "addFromMirror", params, this.oldTypeService, true).map(
            stResp => {
                this.eventHandler.refreshDataBroadcastEvent.emit();
                return stResp;
            }
        );
    }

    /**
     * Returns the default namespace of the currently open project
     */
    getDefaultNamespace(): Observable<string> {
        console.log("[MetadataServices] getDefaultNamespace");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getDefaultNamespace", params, this.oldTypeService, true);
    }

    /**
     * Sets default namespace
     * @param namespace
     */
    setDefaultNamespace(namespace: string) {
        console.log("[MetadataServices] setDefaultNamespace");
        var params = {
            namespace: namespace
        };
        return this.httpMgr.doPost(this.serviceName, "setDefaultNamespace", params, this.oldTypeService, true);
    }

    /**
     * Returns the baseURI of the currently open project
     */
    getBaseURI(): Observable<string> {
        console.log("[MetadataServices] getBaseURI");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getBaseURI", params, this.oldTypeService, true);
    }

    /**
     * Returns the URI obtained expanding the given qname
     */
    expandQName(qname: string): Observable<string> {
        console.log("[MetadataServices] expandQName");
        var params: any = {
            qname: qname
        };
        return this.httpMgr.doGet(this.serviceName, "expandQName", params, this.oldTypeService, true);
    }

}