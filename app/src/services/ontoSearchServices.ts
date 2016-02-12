import {Injectable} from 'angular2/core';
import {Http} from 'angular2/http';
import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class OntoSearchServices {

    private serviceName = "OntoSearch";
    private oldTypeService = true;

    constructor(private http: Http, private httpMgr: HttpManager) { }

    searchOntology(inputString: string, types: string, scheme?: string) {
        console.log("[OntoSearchServices] searchOntology");
        var params: any = {
            inputString: inputString,
            types: types
        };
        if (scheme != undefined) {
            params.scheme = scheme;
        }
        return this.httpMgr.doGet(this.serviceName, "searchOntology", params, this.oldTypeService);
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
        return this.httpMgr.doGet(this.serviceName, "getPathFromRoot", params, this.oldTypeService);
    }

}