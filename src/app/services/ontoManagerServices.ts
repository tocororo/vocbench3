import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OntologyMirror } from '../models/Metadata';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class OntoManagerServices {

    private serviceName = "OntManager";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the list of cached ontology files which replicate the content of ontologies on the web
     * @return Returns a collection of object {file: string, namespace: string} containing
     * "file" (the name of the mirror file) and
     * "namespace" (the namespace of the ontology)
     */
    getOntologyMirror(): Observable<OntologyMirror[]> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getOntologyMirror", params).pipe(
            map(stResp => {
                let mirrors: { file: string, baseURI: string }[] = [];
                let mirrorNodeColl: any[] = stResp;
                for (let i = 0; i < mirrorNodeColl.length; i++) {
                    mirrors.push({ file: mirrorNodeColl[i].file, baseURI: mirrorNodeColl[i].baseURI });
                }
                return mirrors;
            })
        );
    }

    /**
     * Deletes an ontology mirror file
     * @param namespace namespace of the ontology
     * @param fileName name of the mirror file cached on server
     */
    deleteOntologyMirrorEntry(baseURI: string, cacheFileName: string) {
        let params: any = {
            baseURI: baseURI,
            cacheFileName: cacheFileName
        };
        return this.httpMgr.doPost(this.serviceName, "deleteOntologyMirrorEntry", params);
    }

    /**
     * Updates an entry (and its associated physical file) from the Ontology Mirror. The entry can be updated
     * in three different ways (determined by the parameter updateType, differentiating in the source
     * of the updated ontology:
     *  - updateFromBaseURI: the source is retrieved from the supplied baseURI
     *  - updateFromAlternativeURL: the source is retrieved from the address hold by the parameter alternativeURL
     *  - updateFromFile: the source has been supplied in the request body (and mapped to the parameter inputFile)
     * @param updateType
     * @param baseURI baseURI of the ontology 
     * @param mirrorFileName the name of the ontology mirror file to update
     * @param alternativeURL alternative URL to where download the ontology to mirror. To provide only if srcLoc is "walturl"
     * @param inputFile file to update onto mirror. To provide only if srcLoc is "lf"
     */
    updateOntologyMirrorEntry(updateType: "updateFromBaseURI" | "updateFromAlternativeURL" | "updateFromFile",
        baseURI: string, mirrorFileName: string, alternativeURL?: string, inputFile?: File) {
        let params: any = {
            updateType: updateType,
            baseURI: baseURI,
            mirrorFileName: mirrorFileName,
        };
        if (alternativeURL != undefined) {
            params.alternativeURL = alternativeURL;
        }
        if (inputFile != undefined) {
            params.inputFile = inputFile;
        }
        if (updateType == "updateFromFile") {
            //in this case, the update is from a local file, so send the file with a POST
            return this.httpMgr.uploadFile(this.serviceName, "updateOntologyMirrorEntry", params);
        } else {
            return this.httpMgr.doPost(this.serviceName, "updateOntologyMirrorEntry", params);
        }
    }

}