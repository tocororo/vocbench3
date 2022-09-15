import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTURIResource } from "../models/ARTResources";
import { PluginSpecification } from '../models/Plugins';
import { DataFormat, RDFFormat } from "../models/RDFFormat";
import { Deserializer } from "../utils/Deserializer";
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";

@Injectable()
export class ExportServices {

    private serviceName = "Export";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the list of named graphs
     */
    getNamedGraphs(): Observable<ARTURIResource[]> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getNamedGraphs", params).pipe(
            map(stResp => {
                return Deserializer.createURIArray(stResp);
            })
        );
    }

    /**
     * Returns the list of available output formats
     */
    getOutputFormats(): Observable<RDFFormat[]> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getOutputFormats", params).pipe(
            map(stResp => {
                let formats: RDFFormat[] = [];
                for (let i = 0; i < stResp.length; i++) {
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
                formats.sort((a: RDFFormat, b: RDFFormat) => {
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                });
                return formats;
            })
        );
    }

    /**
     * Returns formats accepted by a ReformattingExporter
     * @param reformattingExporterID 
     */
    getExportFormats(reformattingExporterID: string): Observable<DataFormat[]> {
        let params = {
            reformattingExporterID: reformattingExporterID
        };
        return this.httpMgr.doGet(this.serviceName, "getExportFormats", params).pipe(
            map(stResp => {
                let formats: DataFormat[] = [];
                for (let f of stResp) {
                    formats.push(DataFormat.parse(f));
                }
                //sort by name
                formats.sort((a: DataFormat, b: DataFormat) => {
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                });
                return formats;
            })
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
        let params: any = {
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
        let options: VBRequestOptions = new VBRequestOptions({
            errorHandlers: [
                { className: 'it.uniroma2.art.semanticturkey.services.core.export.NullGraphNotExportedException', action: 'skip' },
                { className: 'it.uniroma2.art.semanticturkey.services.core.export.UnnamedGraphNotExportedException', action: 'skip' },
                { className: 'it.uniroma2.art.semanticturkey.extension.extpts.reformattingexporter.ReformattingWrongModelException', action: 'skip' },
                { className: 'it.uniroma2.art.semanticturkey.extension.extpts.reformattingexporter.ReformattingWrongLexModelException', action: 'skip' },
                { className: 'it.uniroma2.art.semanticturkey.extension.extpts.deployer.DeploymentConstraintsViolationException', action: 'skip' },
            ]
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