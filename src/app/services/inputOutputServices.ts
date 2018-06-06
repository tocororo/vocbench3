import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TransitiveImportMethodAllowance } from "../models/Metadata";
import { DataFormat, RDFFormat } from "../models/RDFFormat";
import { HttpManager } from "../utils/HttpManager";
import { VBEventHandler } from "../utils/VBEventHandler";
import { PluginSpecification } from '../models/Plugins';

@Injectable()
export class InputOutputServices {

    private serviceName = "InputOutput";

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }


    /**
     * 
     * @param baseURI 
     * @param transitiveImportAllowance 
     * @param inputFile 
     * @param format 
     * @param loaderSpec 
     * @param rdfLifterSpec 
     * @param transformationPipeline a JSON string representing an array of TransformationStep.
     * @param validateImplicitly 
     */
    loadRDF(baseURI: string, transitiveImportAllowance: TransitiveImportMethodAllowance, inputFile?: File, format?: string, 
        loaderSpec?: PluginSpecification, rdfLifterSpec?: PluginSpecification, transformationPipeline?: string, validateImplicitly?: boolean) {
        console.log("[InputOutputServices] loadRDF");
        var data: any = {
            baseURI: baseURI,
            transitiveImportAllowance: transitiveImportAllowance,
        }
        if (inputFile != null) {
            data.inputFile = inputFile;
        }
        if (format != null) {
            data.format = format;
        }
        if (loaderSpec != null) {
            data.loaderSpec = JSON.stringify(loaderSpec);
        }
        if (rdfLifterSpec != null) {
            data.rdfLifterSpec = JSON.stringify(rdfLifterSpec);
        }
        if (transformationPipeline != null) {
            data.transformationPipeline = transformationPipeline;
        }
        if (validateImplicitly != null) {
            data.validateImplicitly = validateImplicitly;
        }
        return this.httpMgr.uploadFile(this.serviceName, "loadRDF", data).map(
            stResp => {
                this.eventHandler.refreshDataBroadcastEvent.emit();
                return stResp;
            }
        );
    }

    /**
     * Tries to match the extension of a file name against the list of RDF formats that can be parsed
     * @param fileName 
     */
    getParserFormatForFileName(fileName: string) {
        console.log("[InputOutputServices] getParserFormatForFileName");
        var params: any = {
            fileName: fileName
        }
        return this.httpMgr.doGet(this.serviceName, "getParserFormatForFileName", params);
    }

    /**
     * Tries to match the extension of a file name against the list of RDF formats that can be written
     * @param fileName 
     */
    getWriterFormatForFileName(fileName: string) {
        console.log("[InputOutputServices] getWriterFormatForFileName");
        var params: any = {
            fileName: fileName
        }
        return this.httpMgr.doGet(this.serviceName, "getWriterFormatForFileName", params);
    }

    /**
     * Deletes all the data of the current project model
     */
    clearData() {
        console.log("[InputOutputServices] clearData");
        var params: any = {};
        return this.httpMgr.doPost(this.serviceName, "clearData", params);
    }

    /**
     * 
     * @param extensionID 
     */
    getSupportedFormats(extensionID: string): Observable<DataFormat[]> {
        console.log("[ExportServices] getSupportedFormats");
        var params = {
            extensionID: extensionID
        };
        return this.httpMgr.doGet(this.serviceName, "getSupportedFormats", params).map(
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

}