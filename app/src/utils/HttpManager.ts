import {Injectable} from 'angular2/core';
import {Http, Response, Headers, HTTP_PROVIDERS} from 'angular2/http';
import 'rxjs/Rx'; //for map function
import {Observable} from 'rxjs/Observable';
import {STResponseUtils} from "../utils/STResponseUtils";
import {VocbenchCtx} from './VocbenchCtx';
import { ModalServices } from "../widget/modal/modalServices";

@Injectable()
export class HttpManager {

    private contentTypeXml: string = "application/xml";
    private contentTypeJson: string = "application/json";

    private serverhost: string = "127.0.0.1";
    // private serverhost: string = "160.80.84.190";
    private serverport: string = "1979";
    //new services url parts
    private serverpath: string = "semanticturkey";
    private groupId: string = "it.uniroma2.art.semanticturkey";
    private artifactId: string = "st-core-services";
    //old services url parts
    private oldServerpath: string = "resources/stserver/STServer";

    constructor(private http: Http, private vbCtx: VocbenchCtx, private modalService: ModalServices) { }
    
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
     */
    doGet(service: string, request: string, params, oldType: boolean, respJson?: boolean) {
        var url: string = "http://" + this.serverhost + ":" + this.serverport + "/" + this.serverpath + "/";
        if (oldType) {
            url += this.oldServerpath + "?service=" + service + "&request=" + request + "&";
        } else {
            url += this.groupId + "/" + this.artifactId + "/" + service + "/" + request + "?";
        }
        
        //add parameters
        if (this.vbCtx.getProject() != undefined) {
            url += "ctx_project=" + encodeURIComponent(this.vbCtx.getProject().getName()) + "&";    
        }
        for (var paramName in params) {
            url += paramName + "=" + encodeURIComponent(params[paramName]) + "&";
        }

        console.log("[GET]: " + url);
        
        var headers = new Headers();
        var acceptRespType = respJson ? "application/json" : "application/xml";
        headers.append('Accept', acceptRespType);
        
        //execute request
        return this.http.get(url, { headers: headers })
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
                console.error(error);
                this.modalService.alert("Error", error, "error");
                return Observable.throw(error);
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
     */
    doPost(service: string, request: string, params, oldType: boolean, respJson?: boolean) {
        var url: string = "http://" + this.serverhost + ":" + this.serverport + "/" + this.serverpath + "/";
        if (oldType) {
            url += this.oldServerpath + "?service=" + service + "&request=" + request + "&";
        } else {
            url += this.groupId + "/" + this.artifactId + "/" + service + "/" + request + "?";
        }
        
        //add ctx parameters
        if (this.vbCtx.getProject() != undefined) {
            url += "ctx_project=" + encodeURIComponent(this.vbCtx.getProject().getName()) + "&";    
        }

        console.log("[POST]: " + url);
        
        //prepare form data
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        var acceptRespType = respJson ? "application/json" : "application/xml";
        headers.append('Accept', acceptRespType);
        var postData;
        var strBuilder = [];
        for (var paramName in params) {
            strBuilder.push(encodeURIComponent(paramName) + "=" + encodeURIComponent(params[paramName]));
        }
        postData = strBuilder.join("&"); 
        
        //execute request
        return this.http.post(url, postData, { headers: headers })
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
                console.error(error);
                this.modalService.alert("Error", error, "error");
                return Observable.throw(error);
            });
    }
    
    /**
     * Upload a file through an HTTP POST request. 
     * Note, this method doesn't use the Http module of Angular2 (since in Angular2 the FormData in the POST is non yet supported),
     * but it uses a classic XMLHttpRequest and return an Observable to align this method response with the others.
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
     */
    uploadFile(service: string, request: string, params, oldType: boolean) {
        var url: string = "http://" + this.serverhost + ":" + this.serverport + "/" + this.serverpath + "/";
        if (oldType) {
            url += this.oldServerpath + "?service=" + service + "&request=" + request + "&";
        } else {
            url += this.groupId + "/" + this.artifactId + "/" + service + "/" + request + "?";
        }
        
        //add ctx parameters
        if (this.vbCtx.getProject() != undefined) {
            url += "ctx_project=" + encodeURIComponent(this.vbCtx.getProject().getName()) + "&";    
        }
        console.log("[POST]: " + url);
        
        var formData = new FormData();
        for (var paramName in params) {
            formData.append(paramName, params[paramName]);
        }
        
        var httpReq = new XMLHttpRequest();
        httpReq.open("POST", url, true);
        //headers
        httpReq.setRequestHeader("Accept", "application/xml");
        
        return new Observable(o => {
            //handle the request completed
            httpReq.onreadystatechange = function(event) {
                if (httpReq.readyState === 4) { //request finished and response is ready
                    if (httpReq.status === 200) {
                        var parser = new DOMParser();
                        var stResp = parser.parseFromString(httpReq.responseText, "application/xml");
                        o.next(stResp);
                        o.complete();
                    } else {
                        throw new Error(httpReq.statusText);
                    }
                }
            };
            //execute the post
            httpReq.send(formData);
        })
        .map(stResp => {
            if (STResponseUtils.isErrorResponse(stResp)) {
                throw new Error(STResponseUtils.getErrorResponseMessage(stResp));
            } else {
                return STResponseUtils.getResponseData(stResp);
            }
        })
        .catch(error => {
            console.error(error);
            this.modalService.alert("Error", error, "error");
            return Observable.throw(error);
        });
        
    }
    
    /**
     * Executes an XMLHttpRequest GET to get a file
     */
    downloadFile(service: string, request: string, params, oldType: boolean) {
        var url: string = "http://" + this.serverhost + ":" + this.serverport + "/" + this.serverpath + "/";
        if (oldType) {
            url += this.oldServerpath + "?service=" + service + "&request=" + request + "&";
        } else {
            url += this.groupId + "/" + this.artifactId + "/" + service + "/" + request + "?";
        }
        
        //add parameters
        if (this.vbCtx.getProject() != undefined) {
            url += "ctx_project=" + encodeURIComponent(this.vbCtx.getProject().getName()) + "&";    
        }
        for (var paramName in params) {
            url += paramName + "=" + encodeURIComponent(params[paramName]) + "&";
        }

        console.log("[GET]: " + url);
        
        var httpReq = new XMLHttpRequest();
        httpReq.open("GET", url, true);
        httpReq.responseType = "blob";
        
        return new Observable(o => {
            //handle the request completed
            httpReq.onreadystatechange = function(event) {
                if (httpReq.readyState === 4) { //request finished and response is ready
                    if (httpReq.status === 200) {
                        o.next(httpReq.response);
                        o.complete();
                    } else {
                        throw new Error(httpReq.statusText);
                    }
                }
            };
            //execute the get
            httpReq.send(null);
        })
        .catch(error => {
            console.error(error);
            this.modalService.alert("Error", error, "error");
            return Observable.throw(error);
        });
        
    }

    private isResponseXml(response: Response): boolean {
        return response.headers.get("Content-Type").indexOf(this.contentTypeXml) != -1;
    }

    private isResponseJson(response: Response): boolean {
        return response.headers.get("Content-Type").indexOf(this.contentTypeJson) != -1;
    }

}