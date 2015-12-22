System.register(['angular2/core', 'angular2/http', 'rxjs/add/operator/map', './VocbenchCtx'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, http_1, VocbenchCtx_1;
    var HttpManager;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (_1) {},
            function (VocbenchCtx_1_1) {
                VocbenchCtx_1 = VocbenchCtx_1_1;
            }],
        execute: function() {
            HttpManager = (function () {
                function HttpManager(http, vocbenchCtx) {
                    this.http = http;
                    this.vocbenchCtx = vocbenchCtx;
                    this.contentTypeXml = "application/xml";
                    this.contentTypeJson = "application/json";
                    this.serverhost = "127.0.0.1";
                    this.serverport = "1979";
                    //new services url parts
                    this.serverpath = "semanticturkey";
                    this.groupId = "it.uniroma2.art.semanticturkey";
                    this.artifactId = "st-core-services";
                    //old services url parts
                    this.oldServerpath = "resources/stserver/STServer";
                }
                /*
                 * params must be an object list like:
                 * {
                 * 	"urlParName1" : "urlParValue1",
                 * 	"urlParName2" : "urlParValue2",
                 * 	"urlParName3" : "urlParValue3",
                 * }
                 * oldType tells if the request is for the old services or new ones
                 */
                HttpManager.prototype.doGet = function (service, request, params, oldType) {
                    var url = "http://" + this.serverhost + ":" + this.serverport + "/" + this.serverpath + "/";
                    if (oldType) {
                        url += this.oldServerpath + "?service=" + service + "&request=" + request + "&";
                    }
                    else {
                        url += this.groupId + "/" + this.artifactId + "/" + service + "/" + request + "?";
                    }
                    //add parameters
                    url += "ctx_project=" + encodeURIComponent(this.vocbenchCtx.getProject()) + "&";
                    for (var key in params) {
                        url += key + "=" + encodeURIComponent(params[key]) + "&";
                    }
                    console.log("[GET]: " + url); //CHECK FOR LOGGER MODULE IN ANGULAR 2
                    //execute request
                    return this.http.get(url)
                        .map(function (res) { return res.text(); }); //equivalent to a function that takes res parameter and return res.text()
                    //subscribe to it so that we can observe values that are returned
                    // .subscribe(
                    //     function(data) { this.requestSuccessCallback(data) } ,
                    //     function(err) { this.requestErrorCallback(err) },
                    //     function() { console.log('Call Complete') }
                    // );
                    /*
                    * The parameter res of map function is a ResponseData object,
                    * and can be parsed as binary (blob()), string (text()) or JavaScript via JSON (json())
                    */
                    /*subscribe takes 3 functions as parameter
                    * next case, or what happens when the HTTP call is successful
                    * error case
                    * the third function defines what happens once the call is complete
                    */
                };
                /*
                 * params must be an object list like:
                 * {
                 * 	"urlParName1" : "urlParValue1",
                 * 	"urlParName2" : "urlParValue2",
                 * 	"urlParName3" : "urlParValue3",
                 * }
                 * oldType tells if the request is for the old services or new ones
                 */
                HttpManager.prototype.doPost = function (service, request, params, oldType) {
                    var url = "http://" + this.serverhost + ":" + this.serverport + "/" + this.serverpath + "/";
                    if (oldType) {
                        url += this.oldServerpath + "?service=" + service + "&request=" + request + "&";
                    }
                    else {
                        url += this.groupId + "/" + this.artifactId + "/" + service + "/" + request + "?";
                    }
                    //add ctx parameters
                    url += "ctx_project=" + encodeURIComponent(this.vocbenchCtx.getProject()) + "&";
                    console.log("[POST]: " + url); //CHECK FOR LOGGER MODULE IN ANGULAR 2
                    //prepare form data
                    var headers = new http_1.Headers();
                    headers.append('Content-Type', 'application/x-www-form-urlencoded');
                    var postData;
                    var strBuilder = [];
                    for (var i in params) {
                        strBuilder.push(encodeURIComponent(i) + "=" + encodeURIComponent(params[i]));
                    }
                    postData = strBuilder.join("&");
                    //execute request
                    //TODO
                    this.http.post(url, postData, { headers: headers })
                        .map(function (res) { return res.text(); }) //equivalent to a function that takes res parameter and return res.text()
                        .subscribe(function (data) { this.requestSuccessCallback(data); }, function (err) { this.requestErrorCallback(err); }, function () { console.log('Call Complete'); });
                    /*subscribe takes 3 functions as parameter
                    * next case, or what happens when the HTTP call is successful
                    * error case
                    * the third function defines what happens once the call is complete
                    */
                };
                /*
                 * Handle the response in case of success.
                 */
                HttpManager.prototype.requestSuccessCallback = function (response) {
                    if (this.isResponseXml(response)) {
                        var parser = new DOMParser();
                        var stResp = parser.parseFromString(response.data, this.contentTypeXml);
                        var stRespElem = stResp.getElementsByTagName("stresponse")[0];
                        return stRespElem;
                    }
                    else if (this.isResponseJson(response)) {
                        return response.data.stresponse;
                    }
                };
                /*
                 * Handle the response in case of errors in GET/POST (when the server doesn't response)
                 */
                HttpManager.prototype.requestErrorCallback = function (response) {
                    //return $q.reject("Error in HTTP request. Status: " + response.status + ", " + response.statusText);
                };
                HttpManager.prototype.isResponseXml = function (response) {
                    return response.headers("Content-Type").indexOf(this.contentTypeXml) != -1;
                };
                HttpManager.prototype.isResponseJson = function (response) {
                    return response.headers("Content-Type").indexOf(this.contentTypeJson) != -1;
                };
                HttpManager = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [http_1.Http, VocbenchCtx_1.VocbenchCtx])
                ], HttpManager);
                return HttpManager;
            })();
            exports_1("HttpManager", HttpManager);
        }
    }
});
//# sourceMappingURL=HttpManager.js.map