import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TransitiveImportMethodAllowance } from "../models/Metadata";
import { PluginSpecification } from '../models/Plugins';
import { DataFormat, RDFFormat } from "../models/RDFFormat";
import { HttpManager } from "../utils/HttpManager";
import { VBEventHandler } from "../utils/VBEventHandler";

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
    getParserFormatForFileName(fileName: string): Observable<string> {
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
        var params: any = {
            fileName: fileName
        }
        return this.httpMgr.doGet(this.serviceName, "getWriterFormatForFileName", params);
    }

    /**
     * Deletes all the data of the current project model
     */
    clearData() {
        var params: any = {};
        return this.httpMgr.doPost(this.serviceName, "clearData", params);
    }

    /**
     * 
     * @param extensionID 
     */
    getSupportedFormats(extensionID: string): Observable<DataFormat[]> {
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

    /**
     * 
     */
    getInputRDFFormats(): Observable<RDFFormat[]> {
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "getInputRDFFormats", params).map(
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

}