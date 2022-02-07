import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTNode, ARTResource, ARTURIResource } from "../models/ARTResources";
import { Settings } from '../models/Plugins';
import { MultischemeMode, SearchMode, StatusFilter } from "../models/Properties";
import { Deserializer } from "../utils/Deserializer";
import { HttpManager, STRequestParams, VBRequestOptions } from "../utils/HttpManager";

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
        searchMode: SearchMode, langs?: string[], includeLocales?: boolean, schemes?: ARTURIResource[], schemeFilter?: MultischemeMode, options?: VBRequestOptions): Observable<ARTURIResource[]> {
        let params: STRequestParams = {
            searchString: searchString,
            rolesArray: rolesArray,
            useLocalName: useLocalName,
            useURI: useURI,
            useNotes: useNotes,
            searchMode: searchMode,
            langs: langs,
            includeLocales: includeLocales,
            schemes: schemes,
            schemeFilter: schemeFilter,
        };
        options = new VBRequestOptions({
            errorHandlers: [{
                    className: "it.uniroma2.art.semanticturkey.exceptions.SearchStatusException", action: 'warning'
            }]
        }).merge(options);
        return this.httpMgr.doGet(this.serviceName, "searchResource", params, options).pipe(
            map(stResp => {
                return Deserializer.createURIArray(stResp);
            })
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
        searchMode: SearchMode, langs?: string[], includeLocales?: boolean, options?: VBRequestOptions): Observable<ARTURIResource[]> {
        let params: STRequestParams = {
            cls: cls,
            searchString: searchString,
            useLocalName: useLocalName,
            useURI: useURI,
            useNotes: useNotes,
            searchMode: searchMode,
            langs: langs,
            includeLocales: includeLocales
        };
        options = new VBRequestOptions({
            errorHandlers: [{
                    className: "it.uniroma2.art.semanticturkey.exceptions.SearchStatusException", action: 'warning'
            }]
        }).merge(options);
        return this.httpMgr.doGet(this.serviceName, "searchInstancesOfClass", params, options).pipe(
            map(stResp => {
                return Deserializer.createURIArray(stResp);
            })
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
        lexicons?: ARTURIResource[], langs?: string[], includeLocales?: boolean, options?: VBRequestOptions): Observable<ARTURIResource[]> {

        let params: STRequestParams = {
            searchString: searchString,
            useLocalName: useLocalName,
            useURI: useURI,
            useNotes: useNotes,
            searchMode: searchMode,
            lexicons: lexicons,
            langs: langs,
            includeLocales: includeLocales
        };
        options = new VBRequestOptions({
            errorHandlers: [{
                    className: "it.uniroma2.art.semanticturkey.exceptions.SearchStatusException", action: 'warning'
            }]
        }).merge(options);
        return this.httpMgr.doGet(this.serviceName, "searchLexicalEntry", params, options).pipe(
            map(stResp => {
                return Deserializer.createURIArray(stResp, ["index"]);
            })
        );
    }

    /**
     * * Returns the shortest path from a root to the given resource
     * @param resource
     * @param role role of the given resource, available roles: "concept", "cls", "property"
     * @param schemes where all the resource of the path should belong (optional and used only for concept)
     * @param schemeFilter 
     * @param broaderProps 
     * @param narrowerProps 
     * @param includeSubProperties 
     * @param root the root of the class tree (optional and used only for cls)
     * @param options 
     * @return an array of resources
     */
    getPathFromRoot(resource: ARTURIResource, role: string, schemes?: ARTURIResource[], schemeFilter?: MultischemeMode, 
        broaderProps?: ARTURIResource[], narrowerProps?: ARTURIResource[], includeSubProperties?: boolean, 
        root?: ARTURIResource, options?: VBRequestOptions) {
        let params: STRequestParams = {
            role: role,
            resourceURI: resource,
            schemesIRI: schemes,
            schemeFilter: schemeFilter,
            broaderProps: broaderProps,
            narrowerProps: narrowerProps,
            includeSubProperties: includeSubProperties,
            root: root,
        };
        return this.httpMgr.doGet(this.serviceName, "getPathFromRoot", params, options).pipe(
            map(stResp => {
                let shortestPath: ARTURIResource[] = [];
                let paths: ARTURIResource[] = Deserializer.createURIArray(stResp);
                for (let i = 0; i < paths.length; i++) {
                    shortestPath.push(paths[i]);
                    if (paths[i].getURI() == resource.getURI()) {
                        break;
                    }
                }
                return shortestPath;
            })
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
        langs?: string[], includeLocales?: boolean, schemes?: ARTURIResource[], schemeFilter?: MultischemeMode, cls?: ARTURIResource,
        options?: VBRequestOptions): Observable<string[]> {
        let params: STRequestParams = {
            searchString: searchString,
            rolesArray: rolesArray,
            useLocalName: useLocalName,
            searchMode: searchMode,
            langs: langs,
            includeLocales: includeLocales,
            schemes: schemes,
            schemeFilter: schemeFilter,
            cls: cls
        };
        options = new VBRequestOptions({
            errorHandlers: [{
                    className: "it.uniroma2.art.semanticturkey.exceptions.SearchStatusException", action: 'warning'
            }]
        }).merge(options);
        return this.httpMgr.doGet(this.serviceName, "searchStringList", params, options);
    }


    /**
     * 
     * @param searchString 
     * @param searchMode 
     * @param maxNumResults default value = 0 (no limit)
     * @param rolesArray 
     * @param schemes 
     * @param schemeFilter 
     * @param cls 
     * @param options 
     */
    searchURIList(searchString: string, searchMode: SearchMode, maxNumResults?: number, rolesArray?: string[],
        schemes?: ARTURIResource[], schemeFilter?: MultischemeMode, cls?: ARTURIResource, options?: VBRequestOptions): Observable<string[]> {
        let params: STRequestParams = {
            searchString: searchString,
            searchMode: searchMode,
            maxNumResults: maxNumResults,
            rolesArray: rolesArray,
            schemes: schemes,
            schemeFilter: schemeFilter,
            cls: cls
        };
        options = new VBRequestOptions({
            errorHandlers: [{
                    className: "it.uniroma2.art.semanticturkey.exceptions.SearchStatusException", action: 'warning'
            }]
        }).merge(options);
        return this.httpMgr.doGet(this.serviceName, "searchURIList", params, options);
    }


  /**
   * 
   * @param searchString 
   * @param searchMode 
   * @param options 
   */
    searchPrefix(searchString: string, searchMode: SearchMode,options?: VBRequestOptions): Observable<string[]> {
        let params: STRequestParams = {
            searchString: searchString,
            searchMode: searchMode
        };
        return this.httpMgr.doGet(this.serviceName, "searchPrefix", params, options);
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

        let params: STRequestParams = {
            statusFilter: statusFilter,
            searchMode: searchMode,
            langs: langs,
            includeLocales: includeLocales,
            types: types ? this.serializeListOfList(types) : null,
            schemes: schemes ? this.serializeListOfList(schemes) : null,
            ingoingLinks: ingoingLinks ? this.serializeLinks(ingoingLinks) : null,
            outgoingLinks: outgoingLinks ? this.serializeLinks(outgoingLinks) : null,
            outgoingSearch: outgoingSearch ? this.serializeSearchLinks(outgoingSearch) : null,
        };
        if (searchString != null) {
            params.searchString = searchString;
            params.useLocalName = useLocalName;
            params.useURI = useURI;
            params.useNotes = useNotes;
        }
        let options: VBRequestOptions = new VBRequestOptions({
            errorHandlers: [{
                    className: "it.uniroma2.art.semanticturkey.exceptions.SearchStatusException", action: 'warning'
            }]
        });
        return this.httpMgr.doPost(this.serviceName, "advancedSearch", params, options).pipe(
            map(stResp => {
                return Deserializer.createResourceArray(stResp);
            })
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
        let linksSerialization: (string | string[])[][] = [];
        links.forEach((link: { first: ARTURIResource, second: ARTNode[] }) => {
            let secondSerialization: string[] = [];
            link.second.forEach((res: ARTNode) => {
                secondSerialization.push(res.toNT());
            })
            linksSerialization.push([link.first.toNT(), secondSerialization]);
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
        let serialization: (string | SearchMode)[][] = [];
        outgoingSearch.forEach((link: { predicate: ARTURIResource, searchString: string, mode: SearchMode }) => {
            serialization.push([link.predicate.toNT(), link.searchString, link.mode]);
        });
        return JSON.stringify(serialization);
    }


    /**
     * 
     * @param searchParameterizationReference 
     */
    getCustomSearchForm(searchParameterizationReference: string): Observable<Settings> {
        let params: STRequestParams = {
            searchParameterizationReference: searchParameterizationReference
        };
        return this.httpMgr.doGet(this.serviceName, "getCustomSearchForm", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }

    customSearch(searchParameterizationReference: string, boundValues: Map<string, ARTNode>): Observable<ARTResource[]> {
        let params: STRequestParams = {
            searchParameterizationReference: searchParameterizationReference,
            boundValues: boundValues
        };
        return this.httpMgr.doGet(this.serviceName, "customSearch", params).pipe(
            map(stResp => {
                return Deserializer.createResourceArray(stResp);
            })
        );
    }

}