import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpManager} from "../utils/HttpManager";
import {ARTURIResource} from "../utils/ARTResources";


@Injectable()
export class MetadataServices {

    private serviceName = "metadata";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager) {}

    /**
     * Gets prefix mapping of the currently open project.
     * Returns an array of object with
     * "explicit" (tells if the mapping is explicited by the user or set by default),
     * "namespace" the namespace uri
     * "prefix" the prefix
     */
    getNSPrefixMappings() {
        console.log("[MetadataServices] getNSPrefixMappings");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getNSPrefixMappings", params, this.oldTypeService).map(
            stResp => {
                var mappings = [];
                var mappingColl: Array<Element> = stResp.getElementsByTagName("Mapping");
                for (var i = 0; i < mappingColl.length; i++) {
                    var m: any = {};
                    m.explicit = mappingColl[i].getAttribute("explicit") == "true";
                    m.namespace = mappingColl[i].getAttribute("ns");
                    m.prefix = mappingColl[i].getAttribute("prefix");
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
            prefix : prefix,
            namespace: namespace
        };
        return this.httpMgr.doGet(this.serviceName, "setNSPrefixMapping", params, this.oldTypeService);
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
        return this.httpMgr.doGet(this.serviceName, "removeNSPrefixMapping", params, this.oldTypeService);
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
        return this.httpMgr.doGet(this.serviceName, "changeNSPrefixMapping", params, this.oldTypeService);
    }
    
    /**
     * Get imported ontology.
     * Returns an array of object with
     * "status" availble values:
     *      "WEB" (the ontology is imported from the web),
     *      "LOCAL" (the ontology is imported from a local file/mirror)
     *      "NULL" ??
     *      "FAILED" ??
     *      "NG" ??
     *      "UNASSIGNED" ??
     * "uri" the uri of the ontology
     * "localfile" if status is "LOCAL"
     */
    getImports() {
        console.log("[MetadataServices] getImports");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getImports", params, this.oldTypeService).map(
            stResp => {
                var importedOntologies = [];
                var ontologyElemColl: Array<Element> = stResp.getElementsByTagName("ontology");
                for (var i = 0; i < ontologyElemColl.length; i++) {
                    var onto: any = {}
                    onto.status = ontologyElemColl[i].getAttribute("status");
                    onto.uri = ontologyElemColl[i].getAttribute("uri");
                    if (onto.status == "LOCAL") {
                        onto.localfile = ontologyElemColl[i].getAttribute("localfile");
                    }
                    importedOntologies.push(onto);
                }
                return importedOntologies;
            }
        );
    }
    
    /**
     * Removes an imported ontology
     * @param baseURI the baseURI that identifies the imported ontology
     */
    removeImport(baseURI: string) {
        console.log("[MetadataServices] removeImport");
        var params: any = {
            baseuri: baseURI
        };
        return this.httpMgr.doGet(this.serviceName, "removeImport", params, this.oldTypeService);
    }
    
    /**
     * Adds ontology importing it from web. Every time the project is open, the ontology is reimported from web.
     * @param baseURI baseURI of the ontology to import (url of the rdf file works as well)
     * @param altURL alternative URL (???)
     * @param rdfFormat force the format to read the ontology file to import
     */
    addFromWeb(baseURI: string, altURL?: string, rdfFormat?: string) {
        console.log("[MetadataServices] addFromWeb");
        var params: any = {
            baseuri: baseURI
        };
        if (altURL != undefined) {
            params.alturl = altURL;
        }
        if (rdfFormat != undefined) {
            params.rdfFormat = rdfFormat;
        }
        return this.httpMgr.doGet(this.serviceName, "addFromWeb", params, this.oldTypeService);
    }
    
    /**
     * Adds ontology importing it from web and keep a copy of that in a mirror file.
     * @param baseURI baseURI of the ontology to import (url of the rdf file works as well)
     * @param mirrorFile the name of the mirror file
     * @param altURL alternative URL (???)
     * @param rdfFormat force the format to read the ontology file to import
     */
    addFromWebToMirror(baseURI: string, mirrorFile: string, altURL?: string, rdfFormat?: string) {
        console.log("[MetadataServices] addFromWebToMirror");
        var params: any = {
            baseuri: baseURI,
            mirrorFile: mirrorFile
        };
        if (altURL != undefined) {
            params.alturl = altURL;
        }
        if (rdfFormat != undefined) {
            params.rdfFormat = rdfFormat;
        }
        return this.httpMgr.doGet(this.serviceName, "addFromWebToMirror", params, this.oldTypeService);
    }
    
    /**
     * Adds ontology importing it from a local file and keep a copy of that in a mirror file.
     * @param baseURI baseURI of the ontology to import
     * @param localFile the file from the local filesystem to import
     * @param mirrorFile the name of the mirror file
     */
    addFromLocalFile(baseuri: string, localFile: File, mirrorFile: string) {
        console.log("[MetadataServices] addFromLocalFile");
        var data = {
            baseuri: baseuri,
            localFile: localFile,
            mirrorFile: mirrorFile
        };
        return this.httpMgr.uploadFile(this.serviceName, "addFromLocalFile", data, this.oldTypeService);
    }
    
    /**
     * Adds ontology importing it from a mirror file.
     * @param baseURI baseURI of the ontology to import
     * @param mirrorFile the name of the mirror file
     */
    addFromOntologyMirror(baseuri: string, mirrorFile: string) {
        console.log("[MetadataServices] addFromOntologyMirror");
        var params = {
            baseuri: baseuri,
            mirrorFile: mirrorFile
        };
        return this.httpMgr.doGet(this.serviceName, "addFromOntologyMirror", params, this.oldTypeService);
    }
    
    /**
     * Makes a mirror copy of an imported ontology.
     * @param baseURI the baseURI that identifies the imported ontology
     * @param mirrorFile the name of the mirror file where to copy the ontology
     */
    mirrorOntology(baseURI: string, mirrorFile: string) {
        console.log("[MetadataServices] mirrorOntology");
        var params: any = {
            baseuri: baseURI,
            mirrorFile: mirrorFile
        };
        return this.httpMgr.doGet(this.serviceName, "mirrorOntology", params, this.oldTypeService);
    }
    
    /**
     * Returns the default namespace of the currently open project
     */
    getDefaultNamespace(): Observable<string> {
        console.log("[MetadataServices] getDefaultNamespace");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getDefaultNamespace", params, this.oldTypeService).map(
            stResp => {
                return stResp.getElementsByTagName("DefaultNamespace")[0].getAttribute("ns");
            }
        );
    }
    
    /**
     * Sets default namespace
     * @param namespace
     */
    setDefaultNamespace(namespace: string) {
        console.log("[MetadataServices] setDefaultNamespace");
        var params = {
            namespace : namespace
        };
        return this.httpMgr.doGet(this.serviceName, "setDefaultNamespace", params, this.oldTypeService);
    }
    
    /**
     * Returns the baseURI of the currently open project
     */
    getBaseuri(): Observable<string> {
        console.log("[MetadataServices] getBaseuri");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getBaseuri", params, this.oldTypeService).map(
            stResp => {
                return stResp.getElementsByTagName("BaseURI")[0].getAttribute("uri");
            }
        );
    }
    
}