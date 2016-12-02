import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class OntoManagerServices {

    private serviceName = "ontManager";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager) { }
    
    /**
     * Gets the configuration available for the given ontomoly manager.
     * Returns an array of configuration structures {shortName, editRequired, type, params} 
     * where params is in turn an array of struct {description, name, required, value}
     * @param ontMgrID ontology manager id
     */
    getOntManagerParameters(ontMgrID: string) {
        console.log("[OntoManagerServices] getOntManagerParameters");
        var params = {
            ontMgrID: ontMgrID
        };
        return this.httpMgr.doGet(this.serviceName, "getOntManagerParameters", params, this.oldTypeService).map(
            stResp => {
                var configurations = [];
                var configColl = stResp.getElementsByTagName("configuration");
                for (var i = 0; i < configColl.length; i++) {
                    var config: any = {};
                    config.shortName = configColl[i].getAttribute("shortName");
                    config.editRequired = configColl[i].getAttribute("editRequired") == "true";
                    config.type = configColl[i].getAttribute("type");
                    
                    var params = [];
                    var parColl = configColl[i].getElementsByTagName("par");
                    for (var j = 0; j < parColl.length; j++) {
                        var param: any = {};
                        param.description = parColl[j].getAttribute("description");
                        param.name = parColl[j].getAttribute("name");
                        param.required = parColl[j].getAttribute("required") == "true";
                        param.value = parColl[j].textContent;
                        params.push(param);
                    }
                    config.params = params;
                    configurations.push(config);
                }
                return configurations;
            }
        );
    }
    
    /**
     * Gets the list of ontology manager implementations. Returns a list of class names.
     */
    listOntoManager() {
        console.log("[OntoManagerServices] listOntoManager");
        var params = {};
        return this.httpMgr.doGet("systemStart", "listTripleStores", params, this.oldTypeService).map(
            stResp => {
                var ontMgrList = [];
                var repElemColl: Array<Element> = stResp.getElementsByTagName("Repository");
                for (var i = 0; i < repElemColl.length; i++) {
                    ontMgrList.push(repElemColl[i].getAttribute("repName"));
                }
                return ontMgrList;
            }
        );
    }


    /**
     * Returns the list of cached ontology files which replicate the content of ontologies on the web
     * @return Returns a collection of object {file: string, namespace: string} containing
     * "file" (the name of the mirror file) and
     * "namespace" (the namespace of the ontology)
     */
    getOntologyMirror() {
        console.log("[OntoManagerServices] getOntologyMirror");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getOntologyMirror", params, this.oldTypeService).map(
            stResp => {
                var mirrors = [];
                var mirrorElemColl: Array<Element> = stResp.getElementsByTagName("Mirror");
                for (var i = 0; i < mirrorElemColl.length; i++) {
                    var m: any = {};
                    m.file = mirrorElemColl[i].getAttribute("file");
                    m.namespace = mirrorElemColl[i].getAttribute("ns");
                    mirrors.push(m);
                }
                return mirrors;
            }
        );
    }

    /**
     * Deletes an ontology mirror file
     * @param namespace namespace of the ontology
     * @param fileName name of the mirror file cached on server
     */
    deleteOntMirrorEntry(namespace: string, fileName: string) {
        console.log("[OntoManagerServices] deleteOntMirrorEntry");
        var params: any = {
            ns: namespace,
            file: fileName
        };
        return this.httpMgr.doGet(this.serviceName, "deleteOntMirrorEntry", params, this.oldTypeService);
    }

    /**
     * Updates the content of an ontology mirror file. This service allows to update in 3 ways:
     * - from web using baseURI as location
     * - from web using an alternative URL
     * - from a local file
     * @param baseURI baseURI of the ontology 
     * @param mirrorFileName the name of the ontology mirror file to update
     * @param srcLoc available values: wbu (from web with base URI), walturl (from web with alternative URI), lf (from local file)
     * @param altURL alternative URL to where download the ontology to mirror. To provide only if srcLoc is "walturl"
     * @param file file to update onto mirror. To provide only if srcLoc is "lf"
     */
    updateOntMirrorEntry(baseURI: string, mirrorFileName: string, srcLoc: string, altURL?: string, file?: File) {
        console.log("[OntoManagerServices] updateOntMirrorEntry");
        var params: any = {
            baseURI: baseURI,
            mirrorFileName: mirrorFileName,
            srcLoc: srcLoc
        };
        if (altURL != undefined) {
            params.altURL = altURL;
        }
        if (file != undefined) {
            params.localFile = file
        }
        if (srcLoc == "lf") {
            //in this case, the update is from a local file, so send the file with a POST
            return this.httpMgr.uploadFile(this.serviceName, "updateOntMirrorEntry", params, this.oldTypeService);
        } else {
            return this.httpMgr.doGet(this.serviceName, "updateOntMirrorEntry", params, this.oldTypeService);
        }
    }
    

}