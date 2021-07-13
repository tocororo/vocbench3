import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ARTBNode, ARTLiteral, ARTNode, ARTResource, ARTURIResource } from "../models/ARTResources";
import { CustomFormValue } from "../models/CustomForms";
import { VersionInfo } from "../models/History";
import { Project } from "../models/Project";
import { STResponseUtils } from "../utils/STResponseUtils";
import { UIUtils } from "../utils/UIUtils";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalType } from '../widget/modal/Modals';
import { ProjectContext, VBContext } from './VBContext';
import { VBEventHandler } from './VBEventHandler';

@Injectable()
export class HttpManager {

    private serverhost: string;
    //services url parts
    private serverpath: string = "semanticturkey";
    private groupId: string = "it.uniroma2.art.semanticturkey";
    protected artifactId: string = "st-core-services";

    //default request options, to eventually override through options parameter in doGet, doPost, ...
    private defaultRequestOptions: VBRequestOptions = new VBRequestOptions({
        errorAlertOpt: { show: true, exceptionsToSkip: [] }
    });

    constructor(private http: HttpClient, private router: Router, private basicModals: BasicModalServices, private eventHandler: VBEventHandler) {
        this.serverhost = HttpManager.getServerHost();
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
    doGet(service: string, request: string, params: STRequestParams, options?: VBRequestOptions) {
        options = this.defaultRequestOptions.merge(options);

        let url: string = this.getRequestBaseUrl(service, request);

        //add parameters
        url += this.getParametersForUrl(params);
        url += this.getContextParametersForUrl(options);

        let httpOptions = {
            headers: new HttpHeaders({
                "Accept": STResponseUtils.ContentType.applicationJson
            }),
            withCredentials: true
        };

        //execute request
        return this.http.get(url, httpOptions).pipe(
            map(res => { 
                return this.handleOkOrErrorResponse(res); 
            }),
            catchError(error => {
                return this.handleError(error, options.errorAlertOpt);
            })
        );
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
    doPost(service: string, request: string, params: STRequestParams, options?: VBRequestOptions) {
        options = this.defaultRequestOptions.merge(options);

        let url: string = this.getRequestBaseUrl(service, request);

        //add ctx parameters
        url += this.getContextParametersForUrl(options);

        //prepare POST data
        let postData: any = this.getPostData(params);

        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/x-www-form-urlencoded",
                "Accept": STResponseUtils.ContentType.applicationJson
            }),
            withCredentials: true
        };

        //execute request
        return this.http.post(url, postData, httpOptions).pipe(
            map(res => { 
                return this.handleOkOrErrorResponse(res); 
            }),
            catchError(error => {
                return this.handleError(error, options.errorAlertOpt);
            })
        );
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
    uploadFile(service: string, request: string, params: STRequestParams, options?: VBRequestOptions) {
        options = this.defaultRequestOptions.merge(options);
        
        let url: string = this.getRequestBaseUrl(service, request);

        //add ctx parameters
        url += this.getContextParametersForUrl(options);

        //prepare form data
        let formData = new FormData();
        for (let paramName in params) {
            let paramValue = params[paramName];
            if (paramValue != null) {
                if (paramValue instanceof ARTURIResource || paramValue instanceof ARTBNode || paramValue instanceof ARTLiteral) {
                    //it seems that for FormData, I shouldn't invoke encodeURIComponent, otherwise ST converter will raise an exception
                    formData.append(paramName, paramValue.toNT());
                } else {
                    formData.append(paramName, paramValue);
                }
            }
        }

        let httpOptions = {
            headers: new HttpHeaders({
                "Accept": STResponseUtils.ContentType.applicationJson
            }),
            withCredentials: true
        };

        //execute request
        return this.http.post(url, formData, httpOptions).pipe(
            map(res => { 
                return this.handleOkOrErrorResponse(res); 
            }),
            catchError(error => {
                return this.handleError(error, options.errorAlertOpt);
            })
        );
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
    downloadFile(service: string, request: string, params: STRequestParams, post?: boolean, options?: VBRequestOptions): Observable<Blob> {
        options = this.defaultRequestOptions.merge(options);
        
        let url: string = this.getRequestBaseUrl(service, request);

        if (post) {
            //add ctx parameters
            url += this.getContextParametersForUrl(options);

            //prepare POST data
            let postData: string = this.getPostData(params);

            const httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': "application/x-www-form-urlencoded",
                }),
                responseType: 'arraybuffer' as 'arraybuffer',
                withCredentials: true,
                observe: "response" as "response"
            };

            return this.http.post(url, postData, httpOptions).pipe(
                map(
                    res => { return this.arrayBufferRespHandler(res); }
                ),
                catchError(
                    error => { return this.handleError(error, options.errorAlertOpt) }
                )
            );
        } else { //GET
            //add parameters
            url += this.getParametersForUrl(params);
            url += this.getContextParametersForUrl(options);

            let httpOptions = {
                headers: new HttpHeaders(),
                responseType: 'arraybuffer' as 'arraybuffer',
                withCredentials: true,
                observe: "response" as "response"
            };

            //execute request
            return this.http.get(url, httpOptions).pipe(
                map(
                    res => { return this.arrayBufferRespHandler(res); }
                ),
                catchError(
                    error => { return this.handleError(error, options.errorAlertOpt) }
                )
            );
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
        let url: string = this.serverhost + "/" + this.serverpath + "/" + 
            this.groupId + "/" + this.artifactId + "/" + service + "/" + request + "?";
        return url;
    }

    /**
     * Returns the request context parameters.
     */
    private getContextParametersForUrl(options: VBRequestOptions): string {
        let params: string = "";
        /**
         * give priority to ctx_project in the following order:
         * - VBRequestOptions.ctxProject
         * - HttpServiceContext.ctxProject
         * - VBContext.workingProject
         * In case a ctxProject is provided in the VBRequestOptions or HttpServiceContext, the working project is set as consumer
         */
        let ctxProject: Project;
        let ctxConsumer: Project;

        if (options.ctxProject != null) { //if provided get ctxProject from VBRequestOptions
            ctxProject = options.ctxProject;
        } else if (HttpServiceContext.getContextProject() != null) { //otherwise get ctxProject from HttpServiceContext
            ctxProject = HttpServiceContext.getContextProject();
        }
        if (ctxProject != null) { //project provided in VBRequestOptions or HttpServiceContext => set also the consumer
            if (HttpServiceContext.getConsumerProject() != null) {
                ctxConsumer = HttpServiceContext.getConsumerProject();
            } else {
                ctxConsumer = VBContext.getWorkingProject();
            }
        } else { //project not provided in VBRequestOptions or HttpServiceContext => get it from VBContext
            ctxProject = VBContext.getWorkingProject();
        }
        //concat the url parameter
        if (ctxProject != null) {
            params += "ctx_project=" + encodeURIComponent(ctxProject.getName()) + "&";
        }
        if (ctxConsumer != null) {
            params += "ctx_consumer=" + encodeURIComponent(ctxConsumer.getName()) + "&";
        }

        //give priority to version in HttpServiceContext over version in ctx
        if (HttpServiceContext.getContextVersion() != undefined) {
            params += "ctx_version=" + encodeURIComponent(HttpServiceContext.getContextVersion().versionId) + "&";
        } else if (VBContext.getContextVersion() != undefined) { 
            params += "ctx_version=" + encodeURIComponent(VBContext.getContextVersion().versionId) + "&";
        }

        //give priority to working graph in HttpServiceContext over version in ctx
        if (HttpServiceContext.getContextWGraph() != undefined) {
            params += "ctx_wgraph=" + encodeURIComponent(HttpServiceContext.getContextWGraph().toNT()) + "&";
        } else if (VBContext.getContextWGraph() != undefined) {
            params += "ctx_wgraph=" + encodeURIComponent(VBContext.getContextWGraph().toNT()) + "&";
        }

        if (HttpServiceContext.getSessionToken() != undefined) {
            params += "ctx_token=" + encodeURIComponent(HttpServiceContext.getSessionToken()) + "&";
        }

        if (HttpServiceContext.getContextForce()) {
            params += "ctx_force=true&";
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
    private getParametersForUrl(params: STRequestParams): string {
        return this.getPostData(params) + "&"; //differs from getPostData simply for the ending & in order to append ctx parameters
    }

    private getPostData(params: STRequestParams): string {
        let postData: any;
        let strBuilder: string[] = [];
        for (let paramName in params) {
            let paramValue = params[paramName];
            if (paramValue == null) continue;
            if (Array.isArray(paramValue)) {
                let stringArray: string[] = [];
                for (let i = 0; i < paramValue.length; i++) {
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
     * Second step of the "pipeline" of response management:
     * Gets the json or xml response and detect whether it is an error response, in case throws an Error, otherwise return the
     * response data content
     * @param res 
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
    private handleError(err: HttpErrorResponse | Error, errorAlertOpt: ErrorAlertOptions) {
        let error: Error = new Error();
        if (err instanceof HttpErrorResponse) { //error thrown by the angular HttpClient get() or post()
            if (err.error instanceof ErrorEvent) { //A client-side or network error occurred
                let errorMsg = "An error occurred:" + err.error.message;
                this.basicModals.alert({key:"STATUS.ERROR"}, errorMsg, ModalType.error);
                error.name = "Client Error";
                error.message = errorMsg;
            } else { //The backend returned an unsuccessful response code. The response body may contain clues as to what went wrong.
                let errorMsg: string;
                if (!err.ok && err.status == 0 && err.statusText == "Unknown Error") { //attribute of error response in case of no backend response
                    errorMsg = "Connection with ST server (" + this.serverhost + ") has failed; please check your internet connection";
                    this.basicModals.alert({key:"STATUS.ERROR"}, errorMsg, ModalType.error);
                    error.name = "ConnectionError";
                    error.message = errorMsg;
                } else { //backend error response
                    let status: number = err.status;
                    if (status == 401 || status == 403) { //user did a not authorized requests or is not logged in
                        if (err.error instanceof ArrayBuffer) {
                            errorMsg = String.fromCharCode.apply(String, new Uint8Array(err.error));
                        } else {
                            errorMsg = err.error;
                        }
                        error.name = "UnauthorizedRequestError";
                        error.message = err.message;

                        this.basicModals.alert({key:"STATUS.ERROR"}, errorMsg, ModalType.error).then(
                            () => {
                                if (err.status == 401) { ////in case user is not logged at all, reset context and redirect to home
                                    VBContext.resetContext();
                                    HttpServiceContext.resetContext();
                                    this.eventHandler.themeChangedEvent.emit();
                                    this.router.navigate(['/Home']);
                                };
                            },
                            () => {}
                        );
                    } else if (status == 500 || status == 404) { //server error (e.g. out of memory)
                        let errorMsg = (err.statusText != null ? err.statusText : "Unknown response from the server") + " (status: " + err.status + ")";
                        this.basicModals.alert({key:"STATUS.ERROR"}, errorMsg, ModalType.error);
                        error.name = "ServerError";
                        error.message = errorMsg;
                    }
                }
            }
        } else if (err instanceof Error) { //error already parsed and thrown in handleOkOrErrorResponse or arrayBufferRespHandler
            error = err;
            if (
                errorAlertOpt.show && 
                (errorAlertOpt.exceptionsToSkip == null || errorAlertOpt.exceptionsToSkip.indexOf(error.name) == -1) &&
                HttpServiceContext.isErrorInterceptionEnabled()
            ) { //if the alert should be shown
                let errorMsg = error.message != null ? error.message : "Unknown response from the server";
                let errorDetails = error.stack ? error.stack : error.name;
                this.basicModals.alert({key:"STATUS.ERROR"}, errorMsg, ModalType.error, errorDetails);
            }
        }
        UIUtils.stopAllLoadingDiv();
        return throwError(error);
    }


    /**
     * Handle the response of downloadFile that returns an array buffer.
     * This method check if the response is json, in case it could be an json error response.
     * In case, throws an error containing the error message in the response.
     */
     private arrayBufferRespHandler(resp: HttpResponse<ArrayBuffer>) {
        let arrayBuffer = resp.body;
        let respContType = resp.headers.get("content-type");
        if (respContType.includes(STResponseUtils.ContentType.applicationJson+";")) { //could be an error response
            //convert arrayBuffer to json object
            let respContentAsString = String.fromCharCode.apply(String, new Uint8Array(arrayBuffer));
            let jsonResp = JSON.parse(respContentAsString);
            if (STResponseUtils.isErrorResponse(jsonResp)) { //is an error
                let err = new Error(STResponseUtils.getErrorResponseExceptionMessage(jsonResp));
                err.name = STResponseUtils.getErrorResponseExceptionName(jsonResp);
                err.stack = STResponseUtils.getErrorResponseExceptionStackTrace(jsonResp);
                throw err;
            } else { //not an error => return a blob
                let blobResp = new Blob([arrayBuffer], { type: respContType });
                return blobResp;
            }
        } else { //not json => return a blob
            let blobResp = new Blob([arrayBuffer], { type: respContType });
            return blobResp;
        }
    }

    static getServerHost(): string {
        let st_protocol: string = window['st_protocol']; //protocol (http/https)
        let protocol: string = st_protocol ? st_protocol : location.protocol;
        if (!protocol.endsWith(":")) protocol += ":"; //protocol from location includes ending ":", st_protocol variable could not include ":"

        let st_host: string = window['st_host'];
        let host: string = st_host ? st_host : location.hostname;

        let st_port: string = window['st_port'];
        let port: string = st_port ? st_port : location.port;

        let st_path: string = window['st_path']; //url path (optional)
        
        let serverhost = protocol + "//" + host + ":" + port;
        if (st_path != null) {
            serverhost += "/" + st_path;
        }
        return serverhost;
    }

}

export class HttpServiceContext {
    private static ctxProject: Project; //project temporarly used in some scenarios (e.g. exploring other projects)
    private static ctxConsumer: Project; //consumer project temporarly used in some scenarios (e.g. service invoked in group management)
    private static ctxVersion: VersionInfo; //version temporarly used in some scenarios (e.g. versioning res view)
    private static ctxWGraph: ARTResource; // write graph temporarly used in some scenarios
    private static ctxForce: boolean; //true in order to force some operation (e.g. createConcept, addPrefLabel after rejection in validation)
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
     * Methods for managing a contextual working graph (working graph temporarly used in some scenarios)
     */
    static setContextWGraph(wgraph: ARTResource) {
        this.ctxWGraph = wgraph;
    }
    static getContextWGraph(): ARTResource {
        return this.ctxWGraph;
    }
    static removeContextWGraph() {
        this.ctxWGraph = null;
    }

    static setContextForce(force: boolean) {
        this.ctxForce = force;
    }
    static getContextForce(): boolean {
        return this.ctxForce;
    }

    /**
     * Initializes (only if not already initialized) a session token 
     * (to keep track of session in some tools/scenarios like alignment validation or sheet2rdf).
     */
    static initSessionToken() {
        if (this.sessionToken == null) {
            let token = '';
            let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            for (let i = 0; i < 16; i++) {
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
        this.ctxWGraph = null;
        this.sessionToken = null;
        this.interceptError = true;
    }
}


//inspired by angular RequestOptions
export class VBRequestOptions {

    errorAlertOpt: ErrorAlertOptions;
    ctxProject: Project;
    
    constructor({ errorAlertOpt, ctxProject }: VBRequestOptionsArgs = {}) {
        this.errorAlertOpt = errorAlertOpt != null ? errorAlertOpt : null;
        this.ctxProject = ctxProject != null ? ctxProject : null;
    }

    /**
     * Creates a copy of the `VBRequestOptions` instance, using the optional input as values to override existing values.
     * This method will not change the values of the instance on which it is being  called.
     * @param options 
     */
    merge(options?: VBRequestOptions): VBRequestOptions {
        //if options is provided and its parameters is not null, override the value of the current instance
        return new VBRequestOptions({
            errorAlertOpt: options && options.errorAlertOpt != null ? options.errorAlertOpt : this.errorAlertOpt,
            ctxProject: options && options.ctxProject != null ? options.ctxProject : this.ctxProject
        });
    }

    public static getRequestOptions(projectCtx?: ProjectContext): VBRequestOptions {
        if (projectCtx != null) {
            return new VBRequestOptions({ ctxProject: projectCtx.getProject() });
        } else {
            return null;
        }
    }
    
}

//inspired by angular RequestOptionsArgs
interface VBRequestOptionsArgs {
    /**
     * To prevent an alert dialog to show up in case of error during requests.
     * Is useful to handle the error from the component that invokes the service.
     */
    errorAlertOpt?: ErrorAlertOptions;

    ctxProject?: Project;
}

class ErrorAlertOptions {
    show: boolean; //if true HttpManager show the error alert in case of error response, skip the show alert otherwise
    exceptionsToSkip?: string[]; //if provided, tells for which exceptions the alert should be skipped (useful only if show is true)
}

export class STRequestParams { [key: string]: any }