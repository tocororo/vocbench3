import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { ARTURIResource } from "../models/ARTResources";
import { RDFFormat, DataFormat } from "../models/RDFFormat";
import { PluginSpecification } from '../models/Plugins';

@Injectable()
export class ExportServices {

    private serviceName = "Export";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the list of named graphs
     */
    getNamedGraphs(): Observable<ARTURIResource[]> {
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "getNamedGraphs", params).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * Returns the list of available output formats
     */
    getOutputFormats(): Observable<RDFFormat[]> {
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "getOutputFormats", params).map(
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
     * Returns formats accepted by a ReformattingExporter
     * @param reformattingExporterID 
     */
    getExportFormats(reformattingExporterID: string): Observable<DataFormat[]> {
        var params = {
            reformattingExporterID: reformattingExporterID
        };
        return this.httpMgr.doGet(this.serviceName, "getExportFormats", params).map(
            stResp => {
                let formats: DataFormat[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    formats.push(new DataFormat(stResp[i].name, stResp[i].defaultMimeType, stResp[i].defaultFileExtension));
                }
                //sort by name
                formats.sort(
                    function(a: DataFormat, b: DataFormat) {
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
     * 
     * @param graphs array of named graphs to export. If the array is empty all the graphs are 
     *  copied to the target dataset to be exported
     * @param filteringPipeline a JSON string representing an array of TransformationStep.
     *  Each filter is applied to a subset of the exported graphs. No graph means every exported graph.
     *  An example is [{"filter": {"factoryId": string, "properties": { <key>: <value>, ...}}}]
     * @param reformattingExporterSpec an optional ReformattingExporter that reformats the data to a (usually non-RDF) format
     * @param deployerSpec an optional Deployer to export the data somewhere instead of simply downloading it
     * @param includeInferred
     * @param outputFormat the output format. If it does not support graphs, the exported graph are
     *  merged into a single graph
     * @param force if true tells the service to proceed despite the presence of triples in the null
	 *  context or in graphs named by blank nodes. Otherwise, under this conditions the service
	 *  would fail, so that available information is not silently ignored
     */
    export(graphs: ARTURIResource[], filteringPipeline: string, reformattingExporterSpec?: PluginSpecification, 
        deployerSpec?: PluginSpecification, includeInferred?: boolean, outputFormat?: string, force?: boolean): Observable<Blob | any> {
        var params: any = {
            graphs: graphs,
            filteringPipeline: filteringPipeline,
        };
        if (reformattingExporterSpec != null) {
            params.reformattingExporterSpec = JSON.stringify(reformattingExporterSpec);
        }
        if (deployerSpec != null) {
            params.deployerSpec = JSON.stringify(deployerSpec);
        }
        if (outputFormat != null) {
            params.outputFormat = outputFormat;
        }
        if (includeInferred != null) {
            params.includeInferred = includeInferred;
        }
        if (force != null) {
            params.force = force;
        }
        var options: VBRequestOptions = new VBRequestOptions({
            errorAlertOpt: { 
                show: true, 
                exceptionsToSkip: ['it.uniroma2.art.semanticturkey.services.core.ExportPreconditionViolationException'] 
            } 
        });
        if (deployerSpec == null) {
            //no deployer used => the result of the export will be downloaded
            return this.httpMgr.downloadFile(this.serviceName, "export", params, true, options);
        } else {
            //deployer used => the result of the export is deployed, so no file returned
            return this.httpMgr.doPost(this.serviceName, "export", params, options);
        }
        
    }   

}