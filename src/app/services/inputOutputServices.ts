import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class InputOutputServices {

    private serviceName = "InputOutput";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Exports the project model in a given serialization format
     * @param format serialization format
     */
    saveRDF(format: string) {
        console.log("[InputOutputServices] saveRDF");
        var params: any = {
            format: format
        };
        return this.httpMgr.downloadFile(this.serviceName, "saveRDF", params, this.oldTypeService);
    }
    
    /**
     * Loads an RDF-format file in the current project model
     * @param file the file to import
     * @param baseURI the baseURI of the imported data
     * @param format the serialization format of the file
     */
    loadRDF(file: File, baseURI: string, format?: string) {
        console.log("[InputOutputServices] loadRDF");
        var data: any = {
            inputFile: file,
            baseUri: baseURI
        }
        if (format != undefined) {
            data.formatName = format;
        }
        return this.httpMgr.uploadFile(this.serviceName, "loadRDF", data, this.oldTypeService);
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