import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {ARTURIResource} from "../utils/ARTResources";

@Injectable()
export class SearchServices {

    private serviceName = "Search";
    private oldTypeService = false;
    
    constructor(private httpMgr: HttpManager, private deserializer: Deserializer) { }

    /**
     * @param {string[]} rolesArray: available roles: "concept", "cls", "property", "individual"
     * @param {string} searchMode: available searchMode values: "contain", "start", "end", "exact"
     */
    searchResource(searchString: string, rolesArray: string[], useLocalName: boolean, searchMode: string, scheme?: string) {
        console.log("[SearchServices] searchResource");
        var params: any = {
            searchString: searchString,
            rolesArray: rolesArray,
            useLocalName: useLocalName,
            searchMode: searchMode,
        };
        if (scheme != undefined) {
            params.scheme = scheme;
        }
        return this.httpMgr.doGet(this.serviceName, "searchResource", params, this.oldTypeService).map(
            stResp => {
                return this.deserializer.createURIArray(stResp);
            }
        );
    }
    
    /**
     * Returns the shortest path from a root to the given resource
     */
    getPathFromRoot(resourceURI: string, role: string, schemeURI?: string) {
        console.log("[SearchServices] getPathFromRoot");
        var params: any = {
            role: role,
            resourceURI: resourceURI
        };
        if (schemeURI != undefined) {
            params.scheme = schemeURI;
        }
        return this.httpMgr.doGet(this.serviceName, "getPathFromRoot", params, this.oldTypeService).map(
            stResp => {
                var path = new Array<ARTURIResource>();
                var pathColl = stResp.getElementsByTagName("path");
                var shortestPathLength = 99999;
                var shortestPathElem;
                for (var i = 0; i < pathColl.length; i++) { //retrieve shortest path
                    var pathLength = pathColl[i].getAttribute("length");
                    if (pathLength < shortestPathLength) {
                        shortestPathElem = pathColl[i];
                        shortestPathLength = pathLength;
                    }
                }
                path = this.deserializer.createURIArray(shortestPathElem);
                return path;
            }
        );
    }

}