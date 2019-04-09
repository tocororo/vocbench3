import { Injectable } from '@angular/core';
import { Http, Headers, Response, ResponseContentType, RequestOptions } from '@angular/http';
import { Router } from "@angular/router";
import 'rxjs/Rx'; //for map function
import { Observable } from 'rxjs/Observable';
import { STResponseUtils } from "../utils/STResponseUtils";
import { UIUtils } from "../utils/UIUtils";
import { ARTNode, ARTURIResource, ARTBNode, ARTLiteral } from "../models/ARTResources";
import { CustomFormValue } from "../models/CustomForms";
import { Project } from "../models/Project";
import { VersionInfo } from "../models/History";
import { VBContext } from './VBContext';
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";

@Injectable()
export class HttpManager {

    private serverhost: string;
    //services url parts
    private serverpath: string = "semanticturkey";
    private groupId: string = "it.uniroma2.art.semanticturkey";
    private artifactId: string = "st-core-services";

    //default request options, to eventually override through options parameter in doGet, doPost, ...
    private defaultRequestOptions: VBRequestOptions = new VBRequestOptions({
        errorAlertOpt: { show: true, exceptionsToSkip: [] }
    });

    constructor(private http: Http, private router: Router, private basicModals: BasicModalServices) {
        require('file-loader?name=[name].[ext]!../../vbconfig.js'); //this makes webpack copy vbconfig.js to dist folder during the build

        let st_protocol: string = window['st_protocol']; //protocol (http/https)
        let protocol: string = st_protocol ? st_protocol : location.protocol;
        this.serverhost = protocol + "//";

        let st_host: string = window['st_host'];
        let host: string = st_host ? st_host : location.hostname;
        this.serverhost += host;

        let st_port: string = window['st_port'];
        let port: string = st_port ? st_port : location.port;
        this.serverhost += ":" + port;

        let st_path: string = window['st_path']; //url path (optional)
        if (st_path != null) {
            this.serverhost += "/" + st_path;
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
     * @param options further options that overrides the default ones
     */
    doGet(service: string, request: string, params: any, options?: VBRequestOptions) {
        options = this.defaultRequestOptions.merge(options);

        var url: string = this.getRequestBaseUrl(service, request);

        //add parameters
        url += this.getParametersForUrl(params);
        url += this.getContextParametersForUrl(options);

        var headers = new Headers();
        headers.append('Accept', STResponseUtils.ContentType.applicationJson);
        var requestOptions = new RequestOptions({ headers: headers, withCredentials: true });

        //execute request
        return this.http.get(url, requestOptions)
            .map(res => {
                return this.handleJsonXmlResponse(res);
            })
            .map(res => { 
                return this.handleOkOrErrorResponse(res); 
            })
            .catch(error => {
                return this.handleError(error, options.errorAlertOpt);
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
     * @param options further options that overrides the default ones
     */
    doPost(service: string, request: string, params: any, options?: VBRequestOptions) {
        options = this.defaultRequestOptions.merge(options);

        var url: string = this.getRequestBaseUrl(service, request);

        //add ctx parameters
        url += this.getContextParametersForUrl(options);

        //prepare POST data
        var postData: any = this.getPostData(params);

        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        headers.append('Accept', STResponseUtils.ContentType.applicationJson);
        var requestOptions = new RequestOptions({ headers: headers, withCredentials: true });

        //execute request
        return this.http.post(url, postData, requestOptions)
            .map(res => {
                return this.handleJsonXmlResponse(res);
            })
            .map(res => { 
                return this.handleOkOrErrorResponse(res); 
            })
            .catch(error => {
                return this.handleError(error, options.errorAlertOpt);
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
     * @param options further options that overrides the default ones
     */
    uploadFile(service: string, request: string, params: any, options?: VBRequestOptions) {
        options = this.defaultRequestOptions.merge(options);
        
        var url: string = this.getRequestBaseUrl(service, request);

        //add ctx parameters
        url += this.getContextParametersForUrl(options);

        //prepare form data
        var formData = new FormData();
        for (var paramName in params) {
            formData.append(paramName, params[paramName]);
        }

        var headers = new Headers();
        headers.append('Accept', STResponseUtils.ContentType.applicationJson);
        var requestOptions = new RequestOptions({ headers: headers, withCredentials: true });

        //execute request
        return this.http.post(url, formData, requestOptions)
            .map(res => {
                return this.handleJsonXmlResponse(res);
            })
            .map(res => { 
                return this.handleOkOrErrorResponse(res); 
            })
            .catch(error => {
                return this.handleError(error, options.errorAlertOpt);
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
     * @param post tells if the download is done via post-request (e.g. Export.export() service)
     * @param options further options that overrides the default ones
     */
    downloadFile(service: string, request: string, params: any, post?: boolean, options?: VBRequestOptions): Observable<Blob> {
        options = this.defaultRequestOptions.merge(options);
        
        var url: string = this.getRequestBaseUrl(service, request);

        if (post) {
            //add ctx parameters
            url += this.getContextParametersForUrl(options);

            //prepare POST data
            var postData: any = this.getPostData(params);
            var headers = new Headers();
            headers.append('Content-Type', 'application/x-www-form-urlencoded');
            var requestOptions = new RequestOptions({
                headers: headers,
                withCredentials: true,
                responseType: ResponseContentType.ArrayBuffer
            });

            return this.http.post(url, postData, requestOptions)
                .map(
                    res => { return this.arrayBufferRespHandler(res); }
                ).catch(
                    error => { return this.handleError(error, options.errorAlertOpt) }
                );
        } else { //GET
            //add parameters
            url += this.getParametersForUrl(params);
            url += this.getContextParametersForUrl(options);

            var requestOptions = new RequestOptions({
                headers: new Headers(),
                withCredentials: true,
                responseType: ResponseContentType.ArrayBuffer
            });

            //execute request
            return this.http.get(url, requestOptions)
                .map(
                    res => { return this.arrayBufferRespHandler(res); }
                ).catch(
                    error => { return this.handleError(error, options.errorAlertOpt) }
                );
        }

    }

    /**
     * Handle the response of downloadFile that returns an array buffer.
     * This method check if the response is json, in case it could be an json error response.
     * In case, throws an error containing the error message in the response.
     */
    private arrayBufferRespHandler(res: Response) {
        var arrayBuffer = res.arrayBuffer();
        var respContType = res.headers.get("content-type");
        if (respContType.includes(STResponseUtils.ContentType.applicationJson+";")) { //could be an error response
            //convert arrayBuffer to json object
            var respContentAsString = String.fromCharCode.apply(String, new Uint8Array(arrayBuffer));
            let jsonResp = JSON.parse(respContentAsString);
            if (STResponseUtils.isErrorResponse(jsonResp)) { //is an error
                let err = new Error(STResponseUtils.getErrorResponseExceptionMessage(jsonResp));
                err.name = STResponseUtils.getErrorResponseExceptionName(jsonResp);
                err.stack = STResponseUtils.getErrorResponseExceptionStackTrace(jsonResp);
                throw err;
            } else { //not an error => return a blob
                var blobResp = new Blob([arrayBuffer], { type: respContType });
                return blobResp;
            }
        } else { //not json => return a blob
            var blobResp = new Blob([arrayBuffer], { type: respContType });
            return blobResp;
        }
    }

    /**
     * Composes and returns the base part of the URL of a request.
     * "http://<serverhost>/<serverpath>/<groupId>/<artifactId>/<service>/<request>?...
     * @param service the service name
     * @param request the request name
     * 
     */
    private getRequestBaseUrl(service: string, request: string): string {
        var url: string = this.serverhost + "/" + this.serverpath + "/" + 
            this.groupId + "/" + this.artifactId + "/" + service + "/" + request + "?";
        return url;
    }

    /**
     * Returns the request context parameters.
     */
    private getContextParametersForUrl(options: VBRequestOptions): string {
        var params: string = "";
        //give priority to ctx_project in HttpServiceContext over project in ctx
        if (HttpServiceContext.getContextProject() != undefined) {
            params += "ctx_project=" + encodeURIComponent(HttpServiceContext.getContextProject().getName()) + "&";
            //consumer (if not specified is the currently open project)
            if (HttpServiceContext.getConsumerProject() != undefined) {
                params += "ctx_consumer=SYSTEM&";
            } else {
                params += "ctx_consumer=" + encodeURIComponent(VBContext.getWorkingProject().getName()) + "&";
            }
        } else if (VBContext.getWorkingProject() != undefined) { //use the working project otherwise
            params += "ctx_project=" + encodeURIComponent(VBContext.getWorkingProject().getName()) + "&";
        }

        //give priority to version in HttpServiceContext over version in ctx
        if (HttpServiceContext.getContextVersion() != undefined) {
            params += "ctx_version=" + encodeURIComponent(HttpServiceContext.getContextVersion().versionId) + "&";
        } else if (VBContext.getContextVersion() != undefined) { 
            params += "ctx_version=" + encodeURIComponent(VBContext.getContextVersion().versionId) + "&";
        }

        if (HttpServiceContext.getSessionToken() != undefined) {
            params += "ctx_token=" + encodeURIComponent(HttpServiceContext.getSessionToken()) + "&";
        }
        return params;
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
        return this.getPostData(params) + "&"; //differs from getPostData simply for the ending & in order to append ctx parameters
    }

    private getPostData(params: any): string {
        var postData: any;
        var strBuilder: string[] = [];
        for (var paramName in params) {
            var paramValue = params[paramName];
            if (paramValue == null) continue;
            if (Array.isArray(paramValue)) {
                let stringArray: string[] = [];
                for (var i = 0; i < paramValue.length; i++) {
                    if (paramValue[i] instanceof ARTURIResource || paramValue[i] instanceof ARTBNode || paramValue[i] instanceof ARTLiteral) {
                        stringArray.push((<ARTNode>paramValue[i]).toNT());
                    } else {
                        stringArray.push(paramValue[i]);
                    }
                }
                strBuilder.push(encodeURIComponent(paramName) + "=" + encodeURIComponent(stringArray.join(",")));
            } else if (paramValue instanceof Map) {
                let stringMap: {[key: string]: string} = {};
                paramValue.forEach((value: any, key: string) => {
                    if (value instanceof ARTURIResource || value instanceof ARTBNode || value instanceof ARTLiteral) {
                        stringMap[key] = value.toNT();
                    } else {
                        stringMap[key] = value;
                    }
                })
                strBuilder.push(encodeURIComponent(paramName) + "=" + encodeURIComponent(JSON.stringify(stringMap)));
            } else if (paramValue instanceof ARTURIResource || paramValue instanceof ARTBNode || paramValue instanceof ARTLiteral) {
                strBuilder.push(encodeURIComponent(paramName) + "=" + encodeURIComponent((<ARTNode>paramValue).toNT()));
            } else if (paramValue instanceof CustomFormValue) {
                strBuilder.push(encodeURIComponent(paramName) + "=" + encodeURIComponent(JSON.stringify(paramValue)));
            } else {
                strBuilder.push(encodeURIComponent(paramName) + "=" + encodeURIComponent(paramValue));
            }
        }
        postData = strBuilder.join("&");
        return postData;
    }

    /**
     * First step of the "pipeline" of response management:
     * Gets the response and parse it as Json or Xml data according the content type
     * @return returns an object json (any) in case of json response, an xml Document in case of xml response
     */
    private handleJsonXmlResponse(res: Response): any | Document {
        if (res.headers.get("Content-Type").indexOf(STResponseUtils.ContentType.applicationXml) != -1) { //is response Xml?
            var parser = new DOMParser();
            var stResp = parser.parseFromString(res.text(), STResponseUtils.ContentType.applicationXml);
            return stResp;
        } else if (res.headers.get("Content-Type").indexOf(STResponseUtils.ContentType.applicationJson) != -1) { //is response json?
            return res.json();
        }
    }

    /**
     * Second step of the "pipeline" of response management:
     * Gets the json or xml response and detect whether it is an error response, in case throws an Error, otherwise return the
     * response data content
     * @param res response json or xml returned by handleJsonXmlResponse
     */
    private handleOkOrErrorResponse(res: any | Document) {
        if (STResponseUtils.isErrorResponse(res)) {
            let err = new Error(STResponseUtils.getErrorResponseExceptionMessage(res));
            err.name = STResponseUtils.getErrorResponseExceptionName(res);
            err.stack = STResponseUtils.getErrorResponseExceptionStackTrace(res);
            throw err;
        } else {
            return STResponseUtils.getResponseData(res);
        }
    }

    /**
     * Handler for error in requests to ST server. Called in catch clause of get/post requests.
     * This handler returns an Error with a name and message. It is eventually useful in a Component that calls a service that returns 
     * an error, so that it can recognize (through the name) the error (Exception) and eventually catch it and show a proper alert.
     * @param error error catched in catch clause (is a Response in case the error is a 401 || 403 response or if the server doesn't respond)
     * @param errorAlertOpt tells wheter to show error alert. Is useful to handle the error from the component that invokes the service.
     */
    private handleError(err: Response | any, errorAlertOpt: ErrorAlertOptions) {
        let error: Error = new Error();
        /** 
         * Handle errors in case ST server is down. In this case, the Response (err) is an object like the following 
         * { "_body": { "isTrusted": true }, "status": 0, "ok": false,
         * "statusText": "", "headers": {}, "type": 3, "url": null } 
         */
        if (err.status == 0 && !err.ok && err.statusText == "" && err.type == 3 && err.url == null) {
            let errorMsg = "Connection with ST server (" + this.serverhost + ") has failed; please check your internet connection";
            this.basicModals.alert("Error", errorMsg, "error");
            error.name = "ConnectionError";
            error.message = errorMsg;
        } else if (err.status == 401 || err.status == 403) {
            error.name = "UnauthorizedRequestError";
            error.message = err._body;
            //handle errors in case user did a not authorized requests or is not logged in.
            //In this case the response (err) body contains an error message
            this.basicModals.alert("Error", err._body, "error").then(
                (result: any) => {
                    //in case user is not logged at all, reset context and redirect to home
                    if (err.status == 401) {
                        VBContext.resetContext();
                        HttpServiceContext.resetContext();
                        UIUtils.resetNavbarTheme();
                        this.router.navigate(['/Home']);
                    }
                }
            );
        } else if (err.status == 500 || err.status == 404) { //in case of server error (e.g. out of memory)
            let errorMsg = (err.statusText != null ? err.statusText : "Unknown response from the server") + " (status: " + err.status + ")";
            error.name = "ServerError";
            error.message = errorMsg;
            this.basicModals.alert("Error", errorMsg, "error", err._body);
        } else if (err instanceof Error) { //err is already an Error (parsed and thrown in handleOkOrErrorResponse or arrayBufferRespHandler)
            error = err;
            if (errorAlertOpt.show && 
                (errorAlertOpt.exceptionsToSkip == null || errorAlertOpt.exceptionsToSkip.indexOf(error.name) == -1) &&
                HttpServiceContext.isErrorInterceptionEnabled()
            ) { //if the alert should be shown
                let errorMsg = error.message != null ? error.message : "Unknown response from the server";
                let errorDetails = error.stack ? error.stack : error.name;
                this.basicModals.alert("Error", errorMsg, "error", errorDetails);
            }
        }
        //if the previous checks are skipped, it means that the server responded with a 200 that contains a description of an excpetion
        //(needed? maybe the following is already handled by (err instanceof Error) condition)
        else if (errorAlertOpt.show && 
            (errorAlertOpt.exceptionsToSkip == null || errorAlertOpt.exceptionsToSkip.indexOf(error.name) == -1) &&
            HttpServiceContext.isErrorInterceptionEnabled()
        ) { //if the alert should be shown
            error = (<Error>err);
            let errorMsg = error.message != null ? error.message : "Unknown response from the server";
            let errorDetails = error.stack ? error.stack : error.name;
            this.basicModals.alert("Error", errorMsg, "error", errorDetails);
        }
        UIUtils.stopAllLoadingDiv();
        return Observable.throw(error);
    }

}

export class HttpServiceContext {
    private static ctxProject: Project; //project temporarly used in some scenarios (e.g. exploring other projects)
    private static ctxConsumer: Project; //consumer project temporarly used in some scenarios (e.g. service invoked in group management)
    private static ctxVersion: VersionInfo; //version temporarly used in some scenarios (e.g. versioning res view)
    private static sessionToken: string; //useful to keep track of session in some tools/scenarios (es. alignment validation)
    
    //if true, the errors thrown by the service calls are intercepted and a modal is shown. Useful to set to false during multiple additions.
    private static interceptError: boolean = true;

    /**
     * Methods for managing a contextual project (project temporarly used in some scenarios)
     */
    static setContextProject(project: Project) {
        this.ctxProject = project;
    }
    static getContextProject(): Project {
        return this.ctxProject;
    }
    static removeContextProject() {
        this.ctxProject = null;
    }

    /**
     * Methods for managing a contextual consumer project (project temporarly used in some scenarios)
     */
    static setConsumerProject(project: Project) {
        this.ctxConsumer = project;
    }
    static getConsumerProject(): Project {
        return this.ctxConsumer;
    }
    static removeConsumerProject() {
        this.ctxConsumer = null;
    }

    /**
     * Methods for managing a contextual version (version temporarly used in some scenarios)
     */
    static setContextVersion(version: VersionInfo) {
        this.ctxVersion = version;
    }
    static getContextVersion(): VersionInfo {
        return this.ctxVersion;
    }
    static removeContextVersion() {
        this.ctxVersion = null;
    }

    /**
     * Initializes (only if not already initialized) a session token 
     * (to keep track of session in some tools/scenarios like alignment validation or sheet2rdf).
     */
    static initSessionToken() {
        if (this.sessionToken == null) {
            let token = '';
            let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            for (var i = 0; i < 16; i++) {
                let idx = Math.round(Math.random() * (chars.length - 1));
                token = token + chars[idx];
            }
            this.sessionToken = token;
        }
    }
    /**
     * Gets a sessione token (to keep track of session in some tools/scenarios)
     */
    static getSessionToken(): string {
        return this.sessionToken;
    }
    /**
     * Removes a sessione token (to keep track of session in some tools/scenarios)
     */
    static removeSessionToken() {
        this.sessionToken = null;
    }

    /**
     * Disable/enable error interception. In multiple addition is useful to disable temporarly the error interception,
     * in order to avoid to show multiple error modals that report the errors. It is better instead to collect
     * all the error and show just a unique report.
     */
    static isErrorInterceptionEnabled(): boolean {
        return this.interceptError;
    }
    static enableErrorInterception() {
        this.interceptError = true;
    }
    static disableErrorInterception() {
        this.interceptError = false;
    }

    static resetContext() {
        this.ctxProject = null;
        this.ctxConsumer = null;
        this.ctxVersion = null;
        this.sessionToken = null;
        this.interceptError = true;
    }
}


//inspired by angular RequestOptions
export class VBRequestOptions {

    errorAlertOpt: ErrorAlertOptions;
    
    constructor({ errorAlertOpt }: VBRequestOptionsArgs = {}) {
        this.errorAlertOpt = errorAlertOpt != null ? errorAlertOpt : null;
    }

    /**
     * Creates a copy of the `VBRequestOptions` instance, using the optional input as values to override existing values.
     * This method will not change the values of the instance on which it is being  called.
     * @param options 
     */
    merge(options?: VBRequestOptions): VBRequestOptions {
        //if options is provided and its parameters is not null, override the value of the current instance
        return new VBRequestOptions({
            errorAlertOpt: options && options.errorAlertOpt != null ? options.errorAlertOpt : this.errorAlertOpt
        });
    }
}

//inspired by angular RequestOptionsArgs
interface VBRequestOptionsArgs {
    /**
     * To prevent an alert dialog to show up in case of error during requests.
     * Is useful to handle the error from the component that invokes the service.
     */
    errorAlertOpt?: ErrorAlertOptions;
}

class ErrorAlertOptions {
    show: boolean; //if true HttpManager show the error alert in case of error response, skip the show alert otherwise
    exceptionsToSkip?: string[]; //if provided, tells for which exceptions the alert should be skipped (useful only if show is true)
}