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
        var params: any = {
            format: format
        };
        return this.httpMgr.downloadFile(this.serviceName, "saveRDF", params, this.oldTypeService);
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
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "clearData", params, this.oldTypeService);
    }

}