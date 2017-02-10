import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { ARTURIResource } from "../models/ARTResources";
import { RDFFormat } from "../models/RDFFormat";

@Injectable()
export class ExportServices {

    private serviceName = "Export";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the list of named graphs
     */
    getNamedGraphs(): Observable<ARTURIResource[]> {
        console.log("[ExportServices] getNamedGraphs");
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "getNamedGraphs", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * Returns the list of available output formats
     */
    getOutputFormats(): Observable<RDFFormat[]> {
        console.log("[ExportServices] getOutputFormats");
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "getOutputFormats", params, this.oldTypeService, true).map(
            stResp => {
                var formats: RDFFormat[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    let name = stResp[i].name;
                    let charset = stResp[i].charset;
                    let fileExtensions = stResp[i].fileExtensions;
                    let standardURI = stResp[i].standardURI;
                    let mimetypes = stResp[i].mimetypes;
                    let defaultMIMEType = stResp[i].defaultMIMEType;
                    let defaultFileExtension = stResp[i].defaultFileExtension;
                    formats.push(new RDFFormat(name, charset, fileExtensions, standardURI, mimetypes, defaultMIMEType, defaultFileExtension));
                }
                //sort by name
                formats.sort(
                    function(a: RDFFormat, b: RDFFormat) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;
                        return 0;
                    }
                );
                return formats;
            }
        );
    }

    /**
     * decide the format of filteringSteps
     */
    export(graphs: ARTURIResource[], filteringSteps: any[], outputFormat?: RDFFormat, force?: boolean) {

    }

}