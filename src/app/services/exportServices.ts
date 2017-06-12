import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { ARTURIResource } from "../models/ARTResources";
import { RDFFormat } from "../models/RDFFormat";

@Injectable()
export class ExportServices {

    private serviceName = "Export";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the list of named graphs
     */
    getNamedGraphs(): Observable<ARTURIResource[]> {
        console.log("[ExportServices] getNamedGraphs");
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "getNamedGraphs", params, true).map(
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
        return this.httpMgr.doGet(this.serviceName, "getOutputFormats", params, true).map(
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
     * @param graphs array of named graphs to export. If the array is empty all the graphs are 
     *  copied to the target dataset to be exported
     * @param filteringPipeline a JSON string representing an array of FilteringStep.
     *  Each filter is applied to a subset of the exported graphs. No graph means every exported graph.
     *  An example is [{"filter": {"factoryId": string, "properties": { <key>: <value>, ...}}}]
     * @param includeInferred
     * 
     * @param outputFormat the output format. If it does not support graphs, the exported graph are
     *  merged into a single graph
     * @param force if true tells the service to proceed despite the presence of triples in the null
	 *  context or in graphs named by blank nodes. Otherwise, under this conditions the service
	 *  would fail, so that available information is not silently ignored
     */
    export(graphs: ARTURIResource[], filteringPipeline: string, includeInferred?: boolean, outputFormat?: RDFFormat, force?: boolean) {
        console.log("[ExportServices] export");
        var params: any = {
            graphs: graphs,
            filteringPipeline: filteringPipeline,
        };
        if (outputFormat != null) {
            params.outputFormat = outputFormat.name;
        }
        if (includeInferred != null) {
            params.includeInferred = includeInferred;
        }
        if (force != null) {
            params.force = force;
        }
        var options: VBRequestOptions = new VBRequestOptions({ skipErrorAlert: true });
        return this.httpMgr.downloadFile(this.serviceName, "export", params, true, options);
    }   

}