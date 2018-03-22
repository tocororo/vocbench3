import { Injectable } from '@angular/core';
import { HttpManager } from "../utils/HttpManager";
import { VBEventHandler } from "../utils/VBEventHandler";
import { RDFFormat } from "../models/RDFFormat";
import { TransitiveImportMethodAllowance } from "../models/Metadata";

@Injectable()
export class InputOutputServices {

    private serviceName = "InputOutput";

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    /**
     * Loads an RDF-format file in the current project model
     * @param file the file to import
     * @param baseURI the baseURI of the imported data
     * @param transitiveImportAllowance available values 'web' | 'webFallbackToMirror' | 'mirrorFallbackToWeb' | 'mirror'
     * @param format the serialization format of the file
     */
    loadRDF(file: File, baseURI: string, transitiveImportAllowance: TransitiveImportMethodAllowance, format?: RDFFormat, validateImplicitly?: boolean) {
        console.log("[InputOutputServices] loadRDF");
        var data: any = {
            inputFile: file,
            baseURI: baseURI,
            transitiveImportAllowance: transitiveImportAllowance
        }
        if (format != null) {
            data.rdfFormat = format.name;
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

}