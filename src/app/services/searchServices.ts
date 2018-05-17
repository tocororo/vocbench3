import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { SearchMode, StatusFilter } from "../models/Properties";
import { ARTURIResource, ARTResource, ARTNode } from "../models/ARTResources";

@Injectable()
export class SearchServices {

    private serviceName = "Search";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Searches a resource in the model
     * @param searchString the string to search
     * @param rolesArray available roles: "concept", "cls", "property", "individual"
     * @param useLocalName tells if the searched string should be searched in the local name (as well as in labels)
     * @param useURI tells if the searched string should be searched in the entire URI (as well as in labels)
     * @param useNotes tells if the searched string should be searched in the notes
     * @param searchMode available searchMode values: "contain", "start", "end", "exact"
     * @param langs List of langTags, restricts the lexicalization search to only a set of languages
     * @param schemes scheme to which the concept should belong (optional and used only if rolesArray contains "concept")
     * @return an array of resources
     */
    searchResource(searchString: string, rolesArray: string[], useLocalName: boolean, useURI: boolean, useNotes: boolean,
        searchMode: SearchMode, langs?: string[], includeLocales?: boolean, schemes?: ARTURIResource[]): Observable<ARTURIResource[]> {
        console.log("[SearchServices] searchResource");
        var params: any = {
            searchString: searchString,
            rolesArray: rolesArray,
            useLocalName: useLocalName,
            useURI: useURI,
            useNotes: useNotes,
            searchMode: searchMode,
        };
        if (langs != null) {
            params.langs = langs;
        }
        if (includeLocales != null) {
            params.includeLocales = includeLocales;
        }
        if (schemes != null) {
            params.schemes = schemes;
        }
        return this.httpMgr.doGet(this.serviceName, "searchResource", params).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * Searches a resource in the model
     * @param cls class to which the searched instance should belong
     * @param searchString the string to search
     * @param useLocalName tells if the searched string should be searched in the local name (as well as in labels)
     * @param useURI tells if the searched string should be searched in the entire URI (as well as in labels)
     * @param useNotes tells if the searched string should be searched in the notes
     * @param searchMode available searchMode values: "contain", "start", "end", "exact"
     * @param langs List of langTags, restricts the lexicalization search to only a set of languages
     * @return an array of resources
     */
    searchInstancesOfClass(cls: ARTURIResource, searchString: string, useLocalName: boolean, useURI: boolean, useNotes: boolean,
        searchMode: SearchMode, langs?: string[], includeLocales?: boolean): Observable<ARTURIResource[]> {
        console.log("[SearchServices] searchInstancesOfClass");
        var params: any = {
            cls: cls,
            searchString: searchString,
            useLocalName: useLocalName,
            useURI: useURI,
            useNotes: useNotes,
            searchMode: searchMode,
        };
        if (langs != null) {
            params.langs = langs;
        }
        if (includeLocales != null) {
            params.includeLocales = includeLocales;
        }
        return this.httpMgr.doGet(this.serviceName, "searchInstancesOfClass", params).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }


    /**
     * 
     * @param searchString 
     * @param useLocalName 
     * @param useURI 
     * @param useNotes tells if the searched string should be searched in the notes
     * @param searchMode 
     * @param lexicons 
     * @param langs 
     * @param includeLocales 
     */
    searchLexicalEntry(searchString: string, useLocalName: boolean, useURI: boolean, useNotes: boolean, searchMode: SearchMode, 
        lexicons?: ARTURIResource[], langs?: string[], includeLocales?: boolean): Observable<ARTURIResource[]> {

        console.log("[SearchServices] searchLexicalEntry");
        var params: any = {
            searchString: searchString,
            useLocalName: useLocalName,
            useURI: useURI,
            useNotes: useNotes,
            searchMode: searchMode,
        };
        if (lexicons != null) {
            params.lexicons = lexicons;
        }
        if (langs != null) {
            params.langs = langs;
        }
        if (includeLocales != null) {
            params.includeLocales = includeLocales;
        }
        return this.httpMgr.doGet(this.serviceName, "searchLexicalEntry", params).map(
            stResp => {
                return Deserializer.createURIArray(stResp, ["index"]);
            }
        );
    }

    /**
     * Returns the shortest path from a root to the given resource
     * @param resource
     * @param role role of the given resource, available roles: "concept", "cls", "property"
     * @param schemes where all the resource of the path should belong (optional and used only for concept)
     * @param root the root of the class tree (optional and used only for cls)
     * @return an array of resources
     */
    getPathFromRoot(resource: ARTURIResource, role: string, schemes?: ARTURIResource[], root?: ARTURIResource) {
        console.log("[SearchServices] getPathFromRoot");
        var params: any = {
            role: role,
            resourceURI: resource
        };
        if (schemes != null) {
            params.schemesIRI = schemes;
        }
        if (root != null) {
            params.root = root;
        }
        return this.httpMgr.doGet(this.serviceName, "getPathFromRoot", params).map(
            stResp => {
                var shortestPath: ARTURIResource[] = [];
                var paths: ARTURIResource[] = Deserializer.createURIArray(stResp);
                for (var i = 0; i < paths.length; i++) {
                    shortestPath.push(paths[i]);
                    if (paths[i].getURI() == resource.getURI()) {
                        break;
                    }
                }
                return shortestPath;
            }
        );
    }

    /**
     * 
     * @param searchString 
     * @param rolesArray 
     * @param useLocalName 
     * @param searchMode 
     * @param langs 
     * @param schemes 
     */
    searchStringList(searchString: string, rolesArray: string[], useLocalName: boolean, searchMode: SearchMode, 
            langs?: string[], includeLocales?: boolean, schemes?: ARTURIResource[], cls?: ARTURIResource): Observable<string[]> {
        console.log("[SearchServices] searchStringList");
        var params: any = {
            searchString: searchString,
            rolesArray: rolesArray,
            useLocalName: useLocalName,
            searchMode: searchMode,
        };
        if (langs != null) {
            params.langs = langs;
        }
        if (includeLocales != null) {
            params.includeLocales = includeLocales;
        }
        if (schemes != null) {
            params.schemes = schemes;
        }
        if (cls != null) {
            params.cls = cls;
        }
        return this.httpMgr.doGet(this.serviceName, "searchStringList", params);
    }

    /**
     * 
     * @param searchString 
     * @param useLocalName 
     * @param useURI 
     * @param searchMode 
     * @param statusFilter 
     * @param langs 
     * @param includeLocales 
     * @param types 
     * @param schemes 
     * @param outgoingLinks 
     * @param ingoingLinks 
     */
    advancedSearch(searchString: string, useLocalName: boolean, useURI: boolean, useNotes: boolean, searchMode: SearchMode, statusFilter: StatusFilter,
        langs?: string[], includeLocales?: boolean, types?: ARTURIResource[][], schemes?: ARTURIResource[][],
        ingoingLinks?: { first: ARTURIResource, second: ARTNode[] }[], outgoingLinks?: { first: ARTURIResource, second: ARTNode[] }[],
        outgoingSearch?: { predicate: ARTURIResource, searchString: string, mode: SearchMode }[]): Observable<ARTResource[]> {

        console.log("[SearchServices] advancedSearch");
        var params: any = {
            statusFilter: statusFilter
        };
        if (searchString != null) {
            params.searchString = searchString;
            params.useLocalName = useLocalName;
            params.useURI = useURI;
            params.useNotes = useNotes;
            params.searchMode = searchMode;
        }
        if (langs != null) {
            params.langs = langs;
        }
        if (includeLocales != null) {
            params.includeLocales = includeLocales;
        }
        if (types != null) {
            params.types = this.serializeListOfList(types);
        }
        if (schemes != null) {
            params.schemes = this.serializeListOfList(schemes);
        }
        if (ingoingLinks != null) {
            params.ingoingLinks = this.serializeLinks(ingoingLinks);
        }
        if (outgoingLinks != null) {
            params.outgoingLinks = this.serializeLinks(outgoingLinks);
        }
        if (outgoingSearch != null) {
            params.outgoingSearch = this.serializeSearchLinks(outgoingSearch);
        }
        return this.httpMgr.doPost(this.serviceName, "advancedSearch", params).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    private serializeListOfList(lists: ARTURIResource[][]): string {
        let listSerialization: string[][] = [];
        lists.forEach((list: ARTURIResource[]) => {
            let l: string[] = []
            list.forEach((res: ARTURIResource) => {
                l.push(res.toNT());
            })
            listSerialization.push(l);
        });
        return JSON.stringify(listSerialization);
    }

    private serializeLinks(links: { first: ARTURIResource, second: ARTNode[] }[]): string {
        /**
         * list of list, the 2nd list has length 2:
         * 1- first element is a string (serialization of predicate),
         * 2- second element is a list of string (list of serialization of the values)
         */
        let linksSerialization: (string|string[])[][] = [];
        links.forEach((link: { first: ARTURIResource, second: ARTNode[] }) => {
            let secondSerialization: string[] = [];
            link.second.forEach((res: ARTNode) => {
                secondSerialization.push(res.toNT());
            })
            linksSerialization.push([ link.first.toNT(), secondSerialization ]);
        });
        return JSON.stringify(linksSerialization);
    }

    private serializeSearchLinks(outgoingSearch: { predicate: ARTURIResource, searchString: string, mode: SearchMode }[]) {
        /**
         * list of list, the 2nd list has length 3:
         * 1- first element is a string (serialization of predicate)
         * 2- second element is a string (searchString)
         * 3- third element is a SearchMode
         */
        let serialization: (string|SearchMode)[][] = [];
        outgoingSearch.forEach((link: { predicate: ARTURIResource, searchString: string, mode: SearchMode }) => {
            serialization.push([ link.predicate.toNT(), link.searchString, link.mode ]);
        });
        return JSON.stringify(serialization);
    }

}