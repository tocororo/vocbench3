import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {ARTURIResource} from "../utils/ARTResources";

@Injectable()
export class OntoSearchServices {

    private serviceName = "OntoSearch";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager, private deserializer: Deserializer) { }

    searchOntology(inputString: string, types: string, scheme?: string) {
        console.log("[OntoSearchServices] searchOntology");
        var params: any = {
            inputString: inputString,
            types: types
        };
        if (scheme != undefined) {
            params.scheme = scheme;
        }
        return this.httpMgr.doGet(this.serviceName, "searchOntology", params, this.oldTypeService).map(
            stResp => {
                return this.deserializer.createURIArray(stResp);
            }
        );
    }
    
    /**
     * At the moment this service return the path only for conceptTrees
     */
    getPathFromRoot(concept: string, scheme: string) {
        console.log("[OntoSearchServices] getPathFromRoot");
        var params: any = {
            concept: concept,
            scheme: scheme
        };
        return this.httpMgr.doGet(this.serviceName, "getPathFromRoot", params, this.oldTypeService).map(
            stResp => {
                //at the moment the response is not parsable with the Deserializer, in the future
                //the service will be refactored according to the <uri> xml serialization format
                var path = new Array<ARTURIResource>();
                var conceptElemColl = stResp.getElementsByTagName("concept");
                for (var i=0; i<conceptElemColl.length; i++) {
                    var show = conceptElemColl[i].getAttribute("show");
                    var uri = conceptElemColl[i].textContent;
                    path.push(new ARTURIResource(uri, show, "concept"));
                }
                return path;  
            }
        );
    }

}