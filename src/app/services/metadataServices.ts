import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBContext } from "../utils/VBContext";
import { ARTURIResource } from "../models/ARTResources";
import { PrefixMapping, OntologyImport, ImportStatus, TransitiveImportMethodAllowance } from "../models/Metadata";
import { RDFFormat } from "../models/RDFFormat";

@Injectable()
export class MetadataServices {

    private serviceName = "Metadata";

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
        return this.httpMgr.doGet(this.serviceName, "getNamespaceMappings", params, true).map(
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
                VBContext.setPrefixMappings(mappings);
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
        return this.httpMgr.doPost(this.serviceName, "setNSPrefixMapping", params, true);
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
        return this.httpMgr.doPost(this.serviceName, "removeNSPrefixMapping", params, true);
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
        return this.httpMgr.doPost(this.serviceName, "changeNSPrefixMapping", params, true);
    }

    /**
     * Get imported ontology.
     * Returns an array of imports, object with:
     * "status": availble values: "FAILED", "OK"
     * "@id": the uri of the ontology
     * "imports": array of recursive imports
     */
    getImports(): Observable<OntologyImport[]> {
        console.log("[MetadataServices] getImports");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getImports", params, true).map(
            stResp => {
                var importedOntologies: OntologyImport[] = [];

                for (var i = 0; i < stResp.length; i++) {
                    importedOntologies.push(this.parseImport(stResp[i]));
                }
                return importedOntologies;
            }
        );
    }

    private parseImport(importNode: any): OntologyImport {
        var id: string = importNode['@id'];
        var status: ImportStatus = importNode.status;
        var imports: OntologyImport[] = [];
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
        return this.httpMgr.doPost(this.serviceName, "removeImport", params, true).map(
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
    addFromWeb(baseURI: string, transitiveImportAllowance: TransitiveImportMethodAllowance, altURL?: string, rdfFormat?: RDFFormat) {
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
        return this.httpMgr.doPost(this.serviceName, "addFromWeb", params, true).map(
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
    addFromWebToMirror(baseURI: string, mirrorFile: string, transitiveImportAllowance: TransitiveImportMethodAllowance, altURL?: string, rdfFormat?: RDFFormat) {
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
        return this.httpMgr.doPost(this.serviceName, "addFromWebToMirror", params, true).map(
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
    addFromLocalFile(baseURI: string, localFile: File, mirrorFile: string, transitiveImportAllowance: TransitiveImportMethodAllowance) {
        console.log("[MetadataServices] addFromLocalFile");
        var data = {
            baseURI: baseURI,
            localFile: localFile,
            mirrorFile: mirrorFile,
            transitiveImportAllowance: transitiveImportAllowance
        };
        return this.httpMgr.uploadFile(this.serviceName, "addFromLocalFile", data, true).map(
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
    addFromMirror(baseURI: string, mirrorFile: string, transitiveImportAllowance: TransitiveImportMethodAllowance) {
        console.log("[MetadataServices] addFromMirror");
        var params = {
            baseURI: baseURI,
            mirrorFile: mirrorFile,
            transitiveImportAllowance: transitiveImportAllowance
        };
        return this.httpMgr.doPost(this.serviceName, "addFromMirror", params, true).map(
            stResp => {
                this.eventHandler.refreshDataBroadcastEvent.emit();
                return stResp;
            }
        );
    }

    /**
     * Retrieves an ontology that is a failed import from a local file and copies it to the ontology mirror
     * @param baseURI 
     * @param localFile 
     * @param mirrorFile 
     * @param transitiveImportAllowance 
     */
    getFromLocalFile(baseURI: string, localFile: File, mirrorFile: string, transitiveImportAllowance: TransitiveImportMethodAllowance) {
        console.log("[MetadataServices] getFromLocalFile");
        var data = {
            baseURI: baseURI,
            localFile: localFile,
            mirrorFile: mirrorFile,
            transitiveImportAllowance: transitiveImportAllowance
        };
        return this.httpMgr.uploadFile(this.serviceName, "getFromLocalFile", data, true).map(
            stResp => {
                this.eventHandler.refreshDataBroadcastEvent.emit();
                return stResp;
            }
        );
    }

    /**
     * Downloads an ontology that is a failed import from the web
     * @param baseURI 
     * @param transitiveImportAllowance 
     * @param altURL 
     */
    downloadFromWeb(baseURI: string, transitiveImportAllowance: TransitiveImportMethodAllowance, altURL?: string) {
        console.log("[MetadataServices] downloadFromWeb");
        var params: any = {
            baseURI: baseURI,
            transitiveImportAllowance: transitiveImportAllowance
        };
        if (altURL != undefined) {
            params.alturl = altURL;
        }
        return this.httpMgr.doPost(this.serviceName, "downloadFromWeb", params, true).map(
            stResp => {
                this.eventHandler.refreshDataBroadcastEvent.emit();
                return stResp;
            }
        );
    }

    /**
     * Downloads an ontology that is a failed import from the web to the ontology mirror
     * @param baseURI 
     * @param mirrorFile 
     * @param transitiveImportAllowance 
     * @param altURL 
     */
    downloadFromWebToMirror(baseURI: string, mirrorFile: string, transitiveImportAllowance: TransitiveImportMethodAllowance, altURL?: string) {
        console.log("[MetadataServices] downloadFromWebToMirror");
        var params: any = {
            baseURI: baseURI,
            mirrorFile: mirrorFile,
            transitiveImportAllowance: transitiveImportAllowance
        };
        if (altURL != undefined) {
            params.alturl = altURL;
        }
        return this.httpMgr.doPost(this.serviceName, "downloadFromWebToMirror", params, true).map(
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
        return this.httpMgr.doGet(this.serviceName, "getDefaultNamespace", params, true);
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
        return this.httpMgr.doPost(this.serviceName, "setDefaultNamespace", params, true).map(
            stResp => {
                VBContext.getWorkingProject().setDefaultNamespace(namespace);
                return stResp;
            }
        );
    }

    /**
     * Returns the baseURI of the currently open project
     */
    getBaseURI(): Observable<string> {
        console.log("[MetadataServices] getBaseURI");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getBaseURI", params, true);
    }

    /**
     * Returns the URI obtained expanding the given qname
     */
    expandQName(qname: string): Observable<string> {
        console.log("[MetadataServices] expandQName");
        var params: any = {
            qname: qname
        };
        return this.httpMgr.doGet(this.serviceName, "expandQName", params, true);
    }

}