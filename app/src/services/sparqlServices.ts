import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class SparqlServices {

    private serviceName = "sparql";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Executes a query
     * @param query 
     * @param lang query language (e.g. SPARQL)
     * @param infer tells if the query should be evaluated with the inferrence
     * @param mode query or update
     */
    resolveQuery(query: string, lang: string, infer: boolean, mode: string) {
        console.log("[SparqlServices] resolveQuery");
        var data = {
            query: query,
            lang: lang,
            infer: infer,
            mode: mode
        }
        return this.httpMgr.doPost(this.serviceName, "resolveQuery", data, this.oldTypeService, true);
    }

}