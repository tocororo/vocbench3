import { Injectable } from '@angular/core';
import { Http, Headers, Response, ResponseContentType, RequestOptions } from '@angular/http';
import { Router } from "@angular/router";
import 'rxjs/Rx'; //for map function
import { Observable } from 'rxjs/Observable';
import { STResponseUtils } from "../utils/STResponseUtils";
import { ARTNode, ARTURIResource, ARTBNode, ARTLiteral } from "../models/ARTResources";
import { VBContext } from './VBContext';
import { ModalServices } from "../widget/modal/basicModal/modalServices";

@Injectable()
export class HttpManager {

    private contentTypeXml: string = "application/xml";
    private contentTypeJson: string = "application/json";

    private serverhost: string;
    //new services url parts
    private serverpath: string = "semanticturkey";
    private groupId: string = "it.uniroma2.art.semanticturkey";
    private artifactId: string = "st-core-services";
    //old services url parts
    private oldServerpath: string = "resources/stserver/STServer";

    constructor(private http: Http, private router: Router, private modalService: ModalServices) {
        require('file?name=[name].[ext]!../../vbconfig.js'); //this makes webpack copy vbconfig.js to dist folder during the build
        let dynamic_st_host_resolution: boolean = window['dynamic_st_host_resolution'];
        let st_port: string = window['st_port'];
        if (dynamic_st_host_resolution) {
            this.serverhost = location.hostname + ":" + st_port;
        } else {
            this.serverhost = window['st_host'] + ":" + st_port;
        }
    }

    /**
     * Performs an HTTP GET request.
     * @param service the service name
     * @param request the request name
     * @param params the parameters to send in the GET request (as url parameter). This parameter must be an object like:
     *  { 
	 * 	   "urlParName1" : "urlParValue1",
	 * 	   "urlParName2" : "urlParValue2",
	 * 	   "urlParName3" : "urlParValue3",
	 *  }
     * @param oldType tells if the request is for the old services or new ones
     * @param respJson optional, tells if require json response (if ture) or xml (if false or omitted)
     * @param skipErrorAlert If true prevents an alert dialog to show up in case of error.
     *      Is useful to handle the error from the component that invokes the service
     *      (e.g. see deleteScheme in skos or skosxl services)
     */
    doGet(service: string, request: string, params: any, oldType: boolean, respJson?: boolean, skipErrorAlert?: boolean) {
        var url: string = this.getRequestBaseUrl(service, request, oldType);

        //add parameters
        url += this.getParametersForUrl(params);
        url += this.getContextParametersForUrl();

        console.log("[GET]: " + url);

        var headers = new Headers();
        var acceptRespType = respJson ? "application/json" : "application/xml";
        headers.append('Accept', acceptRespType);
        var options = new RequestOptions({ headers: headers, withCredentials: true });

        //execute request
        return this.http.get(url, options)
            .map(res => {
                if (this.isResponseXml(res)) {
                    var parser = new DOMParser();
                    var stResp = parser.parseFromString(res.text(), "application/xml");
                    return stResp;
                } else if (this.isResponseJson(res)) {
                    return res.json();
                }
            })
            .map(stResp => {
                if (STResponseUtils.isErrorResponse(stResp)) {
                    throw new Error(STResponseUtils.getErrorResponseMessage(stResp));
                } else {
                    return STResponseUtils.getResponseData(stResp);
                }
            })
            .catch(error => {
                return this.handleError(error, skipErrorAlert);
            });
    }

    /**
     * Performs an HTTP POST request.
     * @param service the service name
     * @param request the request name
     * @param params the parameters to send in the POST request. This parameter must be an object like:
     *  { 
	 * 	   "urlParName1" : "urlParValue1",
	 * 	   "urlParName2" : "urlParValue2",
	 * 	   "urlParName3" : "urlParValue3",
	 *  }
     * @param oldType tells if the request is for the old services or new ones
     * @param respJson optional, tells if require json response (if ture) or xml (if false or omitted)
     * @param skipErrorAlert If true prevents an alert dialog to show up in case of error.
     *      Is useful to handle the error from the component that invokes the service.
     */
    doPost(service: string, request: string, params: any, oldType: boolean, respJson?: boolean, skipErrorAlert?: boolean) {
        var url: string = this.getRequestBaseUrl(service, request, oldType);

        //add ctx parameters
        url += this.getContextParametersForUrl();

        console.log("[POST]: " + url);

        //prepare POST data
        var postData: any = this.getPostData(params);

        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        var acceptRespType = respJson ? "application/json" : "application/xml";
        headers.append('Accept', acceptRespType);
        var options = new RequestOptions({ headers: headers, withCredentials: true });

        //execute request
        return this.http.post(url, postData, options)
            .map(res => {
                if (this.isResponseXml(res)) {
                    var parser = new DOMParser();
                    var stResp = parser.parseFromString(res.text(), "application/xml");
                    return stResp;
                } else if (this.isResponseJson(res)) {
                    return res.json();
                }
            })
            .map(stResp => {
                if (STResponseUtils.isErrorResponse(stResp)) {
                    throw new Error(STResponseUtils.getErrorResponseMessage(stResp));
                } else {
                    return STResponseUtils.getResponseData(stResp);
                }
            })
            .catch(error => {
                return this.handleError(error, skipErrorAlert);
            });
    }

    /**
     * Upload a file through an HTTP POST request. 
     * In the params object at least one parameter should be a File, otherwise there's no difference between this method and doPost.
     * @param service the service name
     * @param request the request name
     * @param params the parameters to send in the POST request. This parameter must be an object like:
     *  { 
	 * 	   "urlParName1" : "urlParValue1",
	 * 	   "urlParName2" : "urlParValue2",
	 * 	   "urlParName3" : "urlParValue3",
	 *  }
     * @param oldType tells if the request is for the old services or new ones
     * @param respJson optional, tells if require json response (if ture) or xml (if false or omitted)
     * @param skipErrorAlert If true prevents an alert dialog to show up in case of error.
     *      Is useful to handle the error from the component that invokes the service.
     */
    uploadFile(service: string, request: string, params: any, oldType: boolean, respJson?: boolean, skipErrorAlert?: boolean) {
        var url: string = this.getRequestBaseUrl(service, request, oldType);

        //add ctx parameters
        url += this.getContextParametersForUrl();

        console.log("[POST]: " + url);

        //prepare form data
        var formData = new FormData();
        for (var paramName in params) {
            formData.append(paramName, params[paramName]);
        }

        var headers = new Headers();
        var acceptRespType = respJson ? "application/json" : "application/xml";
        headers.append('Accept', acceptRespType);
        var options = new RequestOptions({ headers: headers, withCredentials: true });

        //execute request
        return this.http.post(url, formData, options)
            .map(res => {
                if (this.isResponseXml(res)) {
                    var parser = new DOMParser();
                    var stResp = parser.parseFromString(res.text(), "application/xml");
                    return stResp;
                } else if (this.isResponseJson(res)) {
                    return res.json();
                }
            })
            .map(stResp => {
                if (STResponseUtils.isErrorResponse(stResp)) {
                    throw new Error(STResponseUtils.getErrorResponseMessage(stResp));
                } else {
                    return STResponseUtils.getResponseData(stResp);
                }
            })
            .catch(error => {
                return this.handleError(error, skipErrorAlert);
            });
    }

    /**
     * Execute a request to download a file as Blob object
     * @param service the service name
     * @param request the request name
     * @param params the parameters to send in the request. This parameter must be an object like:
     *  { 
	 * 	   "urlParName1" : "urlParValue1",
	 * 	   "urlParName2" : "urlParValue2",
	 * 	   "urlParName3" : "urlParValue3",
	 *  }
     * @param oldType tells if the request is for the old services or new ones
     * @param post tells if the download is done via post-request (e.g. Export.export() service)
     * @param skipErrorAlert If true prevents an alert dialog to show up in case of error.
     *      Is useful to handle the error from the component that invokes the service.
     */
    downloadFile(service: string, request: string, params: any, oldType: boolean, post?: boolean, skipErrorAlert?: boolean): Observable<Blob> {
        var url: string = this.getRequestBaseUrl(service, request, oldType);

        if (post) {
            //add ctx parameters
            url += this.getContextParametersForUrl();

            console.log("[POST]: " + url);
            //prepare POST data
            var postData: any = this.getPostData(params);
            var headers = new Headers();
            headers.append('Content-Type', 'application/x-www-form-urlencoded');
            var options = new RequestOptions({
                headers: headers,
                withCredentials: true,
                responseType: ResponseContentType.ArrayBuffer
            });

            return this.http.post(url, postData, options)
                .map(
                    res => { return this.arrayBufferRespHanlder(res); }
                ).catch(
                    error => { return this.handleError(error, skipErrorAlert) }
                );
        } else { //GET
            //add parameters
            url += this.getParametersForUrl(params);
            url += this.getContextParametersForUrl();

            console.log("[GET]: " + url);

            var options = new RequestOptions({
                headers: new Headers(),
                withCredentials: true,
                responseType: ResponseContentType.ArrayBuffer
            });

            //execute request
            return this.http.get(url, options)
                .map(
                    res => { return this.arrayBufferRespHanlder(res); }
                ).catch(
                    error => { return this.handleError(error, skipErrorAlert) }
                );
        }

    }

    /**
     * Handle the response of downloadFile that returns an array buffer.
     * This method check if the response is xml, in case it could be an xml error response.
     * In case, throws an error containing the error message in the response.
     */
    private arrayBufferRespHanlder(res: Response) {
        var arrayBuffer = res.arrayBuffer();
        var respContType = res.headers.get("content-type");
        if (respContType.includes("application/xml;")) { //could be an error xml response
            //convert arrayBuffer to xml Document
            var respContentAsString = String.fromCharCode.apply(String, new Uint8Array(arrayBuffer));
            var xmlResp = new DOMParser().parseFromString(respContentAsString, "application/xml");
            if (STResponseUtils.isErrorResponse(xmlResp)) { //is an error
                throw new Error(STResponseUtils.getErrorResponseMessage(xmlResp));
            } else { //not an error => return a blob
                var blobResp = new Blob([arrayBuffer], { type: respContType });
                return blobResp;
            }
        } else { //not xml => return a blob
            var blobResp = new Blob([arrayBuffer], { type: respContType });
            return blobResp;
        }
    }

    /**
     * Composes and returns the base part of the URL of a request.
     * "http://<serverhost>/<serverpath>/<groupId>/<artifactId>/<service>/<request>?... for new services
     * "http://<serverhost>/<serverpath>/resources/stserver/STServer?<service>&<request>&... for old services
     * @param service the service name
     * @param request the request name
     * @param oldType tells if the request is for the old services or new ones
     * 
     */
    private getRequestBaseUrl(service: string, request: string, oldType: boolean): string {
        var url: string = "http://" + this.serverhost + "/" + this.serverpath + "/";
        if (oldType) {
            url += this.oldServerpath + "?service=" + service + "&request=" + request + "&";
        } else {
            url += this.groupId + "/" + this.artifactId + "/" + service + "/" + request + "?";
        }
        return url;
    }

    /**
     * Returns the url parameters to append to the request 
     * @param params the parameters to send in the GET request (as url parameter). This parameter must be an object like:
     * {    
     *  "urlParName1" : ParValue1,
     *  "urlParName2" : ParValue2,
     *  "urlParName3" : ParValue3,
     * }
     * The value of the parameter can be a simple string or any of the ARTResource implementations
     */
    private getParametersForUrl(params: any): string {
        var urlParams: string = "";
        for (var paramName in params) {
            var paramValue = params[paramName];
            if (Array.isArray(paramValue)) {
                let arrayAsString: string = "";
                for (var i = 0; i < paramValue.length; i++) {
                    if (paramValue[i] instanceof ARTURIResource || paramValue[i] instanceof ARTBNode || paramValue[i] instanceof ARTLiteral) {
                        arrayAsString += (<ARTNode>paramValue[i]).toNT() + ",";
                    } else {
                        arrayAsString += paramValue[i] + ",";
                    }
                }
                arrayAsString = arrayAsString.slice(0, -1); //remove last comma (,)
                urlParams += paramName + "=" + encodeURIComponent(arrayAsString) + "&";
            } else if (paramValue instanceof ARTURIResource || paramValue instanceof ARTBNode || paramValue instanceof ARTLiteral) {
                urlParams += paramName + "=" + encodeURIComponent((<ARTNode>paramValue).toNT()) + "&";
            } else {
                urlParams += paramName + "=" + encodeURIComponent(paramValue) + "&";
            }
        }
        return urlParams;
    }

    /**
     * Returns the request context parameters.
     */
    private getContextParametersForUrl(): string {
        var params: string = "";

        //if a (temp) context project is set, use it
        if (VBContext.getContextProject() != undefined) {
            params += "ctx_project=" + encodeURIComponent(VBContext.getContextProject().getName()) + "&";
        } else if (VBContext.getWorkingProject() != undefined) { //use the working project otherwise
            params += "ctx_project=" + encodeURIComponent(VBContext.getWorkingProject().getName()) + "&";
        }

        if (VBContext.getSessionToken() != undefined) {
            params += "ctx_token=" + encodeURIComponent(VBContext.getSessionToken()) + "&";
        }
        return params;
    }

    private getPostData(params: any): string {
        var postData: any;
        var strBuilder: string[] = [];
        for (var paramName in params) {
            var paramValue = params[paramName];
            if (Array.isArray(paramValue)) {
                let arrayAsString: string = "";
                for (var i = 0; i < paramValue.length; i++) {
                    if (paramValue[i] instanceof ARTURIResource || paramValue[i] instanceof ARTBNode || paramValue[i] instanceof ARTLiteral) {
                        arrayAsString += (<ARTNode>paramValue[i]).toNT() + ",";
                    } else {
                        arrayAsString += paramValue[i] + ",";
                    }
                }
                arrayAsString = arrayAsString.slice(0, -1); //remove last comma (,)
                strBuilder.push(encodeURIComponent(paramName) + "=" + encodeURIComponent(arrayAsString));
            } else if (paramValue instanceof ARTURIResource || paramValue instanceof ARTBNode || paramValue instanceof ARTLiteral) {
                strBuilder.push(encodeURIComponent(paramName) + "=" + encodeURIComponent((<ARTNode>paramValue).toNT()));
            } else {
                strBuilder.push(encodeURIComponent(paramName) + "=" + encodeURIComponent(paramValue));
            }
        }
        postData = strBuilder.join("&");
        return postData;
    }

    /**
     * Handler for error in requests to ST server. Called in catch clause of get/post requests.
     * @param error error catched in catch clause
     * @param skipErrorAlert If true prevents an alert dialog to show up in case of error.
     *      Is useful to handle the error from the component that invokes the service. See doGet method.
     */
    private handleError(err: any, skipErrorAlert?: boolean) {
        console.error(err);
        /* 
        Handle errors in case ST server is down. In this case, the response (err) is an object like the following 
        { "_body": { "isTrusted": true }, "status": 0, "ok": false,
          "statusText": "", "headers": {}, "type": 3, "url": null }
        */
        if (err.status == 0 && !err.ok && err.statusText == "" && err.type == 3 && err.url == null) {
            this.modalService.alert("Error",
                "No SemanticTurkey server found! Please check that a server is listening on "
                + this.serverhost + ". Semantic Turkey server can be downloaded from here: "
                + "https://bitbucket.org/art-uniroma2/semantic-turkey/downloads", "error");
        } else if (err.status == 401 || err.status == 403) {
            //handle errors in case user did a not authorized requests or is not logged in.
            //In this case the response (err) body contains an error message
            this.modalService.alert("Error", err._body, "error").then(
                result => {
                    //in case user is not logged at all, reset context and redirect to home
                    if (err.status == 401) {
                        VBContext.resetContext();
                        this.router.navigate(['/Home']);
                    }
                }
            );
        } else if (!skipErrorAlert) {
            this.modalService.alert("Error", err, "error");
        }
        return Observable.throw(err);
    }

    private isResponseXml(response: Response): boolean {
        return response.headers.get("Content-Type").indexOf(this.contentTypeXml) != -1;
    }

    private isResponseJson(response: Response): boolean {
        return response.headers.get("Content-Type").indexOf(this.contentTypeJson) != -1;
    }

}