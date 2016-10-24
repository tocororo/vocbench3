import {Injectable} from '@angular/core';
import {Http, Headers, Response, RequestOptions} from '@angular/http';
import 'rxjs/Rx'; //for map function
import {Observable} from 'rxjs/Observable';
import {STResponseUtils} from "../utils/STResponseUtils";
import {VocbenchCtx} from './VocbenchCtx';
import {ModalServices} from "../widget/modal/modalServices";

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

    constructor(private http: Http, private vbCtx: VocbenchCtx, private modalService: ModalServices) {
        //init serverhost ip (see /config/webpack.prod.js)
        if (process.env.SERVERHOST == undefined) {
            this.serverhost = "127.0.0.1:1979";
        } else {
            this.serverhost = process.env.SERVERHOST;
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
    doGet(service: string, request: string, params, oldType: boolean, respJson?: boolean, skipErrorAlert?: boolean) {
        var url: string = "http://" + this.serverhost + "/" + this.serverpath + "/";
        if (oldType) {
            url += this.oldServerpath + "?service=" + service + "&request=" + request + "&";
        } else {
            url += this.groupId + "/" + this.artifactId + "/" + service + "/" + request + "?";
        }
        
        //add parameters
        for (var paramName in params) {
            url += paramName + "=" + encodeURIComponent(params[paramName]) + "&";
        }
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
    doPost(service: string, request: string, params, oldType: boolean, respJson?: boolean, skipErrorAlert?: boolean) {
        var url: string = "http://" + this.serverhost + "/" + this.serverpath + "/";
        if (oldType) {
            url += this.oldServerpath + "?service=" + service + "&request=" + request + "&";
        } else {
            url += this.groupId + "/" + this.artifactId + "/" + service + "/" + request + "?";
        }
        
        //add ctx parameters
        url += this.getContextParametersForUrl();

        console.log("[POST]: " + url);
        
        //prepare form data
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        var acceptRespType = respJson ? "application/json" : "application/xml";
        headers.append('Accept', acceptRespType);
        var options = new RequestOptions({ headers: headers, withCredentials: true });

        var postData;
        var strBuilder = [];
        for (var paramName in params) {
            strBuilder.push(encodeURIComponent(paramName) + "=" + encodeURIComponent(params[paramName]));
        }
        postData = strBuilder.join("&"); 
        
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
        var url: string = "http://" + this.serverhost + "/" + this.serverpath + "/";
        if (oldType) {
            url += this.oldServerpath + "?service=" + service + "&request=" + request + "&";
        } else {
            url += this.groupId + "/" + this.artifactId + "/" + service + "/" + request + "?";
        }
        
        //add ctx parameters
        url += this.getContextParametersForUrl();
        console.log("[POST]: " + url);
        
        var formData = new FormData();
        for (var paramName in params) {
            formData.append(paramName, params[paramName]);
        }
        
        var httpReq = new XMLHttpRequest();
        httpReq.withCredentials = true;
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
            return this.handleError(error);
        });
        
    }
    
    /**
     * Executes an XMLHttpRequest GET to get a file
     */
    downloadFile(service: string, request: string, params, oldType: boolean) {
        var url: string = "http://" + this.serverhost + "/" + this.serverpath + "/";
        if (oldType) {
            url += this.oldServerpath + "?service=" + service + "&request=" + request + "&";
        } else {
            url += this.groupId + "/" + this.artifactId + "/" + service + "/" + request + "?";
        }
        
        //add parameters
        for (var paramName in params) {
            url += paramName + "=" + encodeURIComponent(params[paramName]) + "&";
        }
        url += this.getContextParametersForUrl();

        console.log("[GET]: " + url);
        
        var httpReq = new XMLHttpRequest();
        httpReq.withCredentials = true;
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
            return this.handleError(error);
        });
        
    }
    
    /**
     * Returns the request context parameters.
     */
    private getContextParametersForUrl(): string {
        var params: string = "";
        
        //if a (temp) context project is set, use it
        if (this.vbCtx.getContextProject() != undefined) {
            params += "ctx_project=" + encodeURIComponent(this.vbCtx.getContextProject().getName()) + "&";
        } else if (this.vbCtx.getWorkingProject() != undefined) { //use the working project otherwise
            params += "ctx_project=" + encodeURIComponent(this.vbCtx.getWorkingProject().getName()) + "&";    
        }
        
        if (this.vbCtx.getSessionToken() != undefined) {
            params += "ctx_token=" + encodeURIComponent(this.vbCtx.getSessionToken()) + "&";
        }
        return params;
    }

    /**
     * Handler for error in requests to ST server. Called in catch clause of get/post requests.
     * @param error error catched in catch clause
     * @param skipErrorAlert If true prevents an alert dialog to show up in case of error.
     *      Is useful to handle the error from the component that invokes the service. See doGet method.
     */
    private handleError(err: any, skipErrorAlert?: boolean) {
        console.error(err);
        console.log("JSON.stringify(err)" + JSON.stringify(err));
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
        } else if (err.status == 401) {
            //handle errors in case user did a not authorized requests.
            //In this case the response (err) body contains an error message
            this.modalService.alert("Error", err._body, "error");
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