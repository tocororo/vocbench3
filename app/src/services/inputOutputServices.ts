import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";




import {Headers, Http} from 'angular2/http';




@Injectable()
export class InputOutputServices {

    private serviceName = "InputOutput";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager, private http: Http) { }

    saveRDF(format: string) {
        console.log("[InputOutputServices] saveRDF");
        var data = {
        }
        return this.httpMgr.doPost(this.serviceName, "saveRDF", data, this.oldTypeService);
    }
    
    loadRDF(file: File, baseURI: string, format: string) {
        console.log("[InputOutputServices] loadRDF");
        var data = {
            inputFile: file,
            baseUri: baseURI,
            formatName: format
        }
        return this.httpMgr.uploadFile(this.serviceName, "loadRDF", data, this.oldTypeService);
    }
    
    clearData() {
        console.log("[InputOutputServices] clearData");
        var data = {
        }
        return this.httpMgr.doPost(this.serviceName, "clearData", data, this.oldTypeService);
    }

}