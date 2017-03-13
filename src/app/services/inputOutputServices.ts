import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {VBEventHandler} from "../utils/VBEventHandler";
import { RDFFormat } from "../models/RDFFormat";

@Injectable()
export class InputOutputServices {

    private serviceName = "InputOutput2";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    /**
     * Loads an RDF-format file in the current project model
     * @param file the file to import
     * @param baseURI the baseURI of the imported data
     * @param transitiveImportAllowance available values 'web' | 'webFallbackToMirror' | 'mirrorFallbackToWeb' | 'mirror'
     * @param format the serialization format of the file
     */
    loadRDF(file: File, baseURI: string, transitiveImportAllowance: string, format?: RDFFormat) {
        console.log("[InputOutputServices] loadRDF");
        var data: any = {
            inputFile: file,
            baseURI: baseURI,
            transitiveImportAllowance: transitiveImportAllowance
        }
        if (format != undefined) {
            data.rdfFormat = format.name;
        }
        return this.httpMgr.uploadFile(this.serviceName, "loadRDF", data, this.oldTypeService, true).map(
            stResp => {
                this.eventHandler.refreshDataBroadcastEvent.emit();
                return stResp;
            }
        );
    }
    
    /**
     * Deletes all the data of the current project model
     */
    clearData() {
        console.log("[InputOutputServices] clearData");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "clearData", params, this.oldTypeService);
    }

}