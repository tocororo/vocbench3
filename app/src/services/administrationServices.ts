import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class AdministrationServices {

    private serviceName = "administration";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the list of cached ontology files which replicate the content of ontologies on the web
     * @return Returns a collection of object containing
     * "file" (the name of the mirror file) and
     * "namespace" (the namespace of the ontology)
     */
    getOntologyMirror() {
        console.log("[AdministrationServices] getOntologyMirror");
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
    
}