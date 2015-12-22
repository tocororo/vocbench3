import {Injectable} from 'angular2/core';
import {Http, Headers, HTTP_PROVIDERS} from 'angular2/http';
import 'rxjs/add/operator/map'; //CHECK IF THIS STILL BE NEEDED IN FUTURE VERSION

import {VocbenchCtx} from './VocbenchCtx';

@Injectable()
export class HttpManager {
    
    private contentTypeXml : string = "application/xml";
	private contentTypeJson : string = "application/json";
	
	private serverhost : string = "127.0.0.1";
	private serverport : string = "1979";
	//new services url parts
	private serverpath : string = "semanticturkey";
	private groupId : string = "it.uniroma2.art.semanticturkey";
	private artifactId : string = "st-core-services";
	//old services url parts
	private oldServerpath : string = "resources/stserver/STServer";
    
	constructor(public http:Http, private vocbenchCtx:VocbenchCtx) {
        
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
    doGet(service:string, request:string, params, oldType:boolean) {
        var url : string = "http://"+ this.serverhost + ":" + this.serverport + "/" + this.serverpath + "/";
		if (oldType) {
			url += this.oldServerpath + "?service=" + service + "&request=" + request + "&";
		} else {
			url += this.groupId + "/" + this.artifactId + "/" + service + "/"+ request +"?";
		}
        
        //add parameters
		url += "ctx_project=" + encodeURIComponent(this.vocbenchCtx.getProject()) + "&";
		for (var key in params) {
			url += key + "=" + encodeURIComponent(params[key]) + "&";
		}
		
		console.log("[GET]: " + url); //CHECK FOR LOGGER MODULE IN ANGULAR 2
        
        //execute request
        return this.http.get(url)
            //map returned value as text
            .map(res => res.text()) //equivalent to a function that takes res parameter and return res.text()
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
    doPost(service:string, request:string, params, oldType:boolean) {
        var url : string = "http://"+ this.serverhost + ":" + this.serverport + "/" + this.serverpath + "/";
		if (oldType) {
			url += this.oldServerpath + "?service=" + service + "&request=" + request + "&";
		} else {
			url += this.groupId + "/" + this.artifactId + "/" + service + "/"+ request +"?";
		}
        
        //add ctx parameters
		url += "ctx_project=" + encodeURIComponent(this.vocbenchCtx.getProject()) + "&";
		
		console.log("[POST]: " + url); //CHECK FOR LOGGER MODULE IN ANGULAR 2
        
        //prepare form data
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        var postData;
        var strBuilder = [];
        for(var i in params){
            strBuilder.push(encodeURIComponent(i) + "=" + encodeURIComponent(params[i]));
        }
        postData = strBuilder.join("&"); 
        
        //execute request
        //TODO
        this.http.post(url, postData, { headers: headers })
            //map returned value as text
            .map(res => res.text()) //equivalent to a function that takes res parameter and return res.text()
            //subscribe to it so that we can observe values that are returned
            .subscribe(
                function(data) { this.requestSuccessCallback(data) } ,
                function(err) { this.requestErrorCallback(err) },
                function() { console.log('Call Complete') }
            );
            /*subscribe takes 3 functions as parameter
            * next case, or what happens when the HTTP call is successful
            * error case
            * the third function defines what happens once the call is complete
            */
    }
    
    /*
	 * Handle the response in case of success. 
	 */
	requestSuccessCallback(response) {
		if (this.isResponseXml(response)) { //XML response
			var parser = new DOMParser();
			var stResp = parser.parseFromString(response.data, this.contentTypeXml);
			var stRespElem = stResp.getElementsByTagName("stresponse")[0];
			return stRespElem;
		} else if (this.isResponseJson(response)){ //JSON response
			return response.data.stresponse;
		}
	}
    
    /*
	 * Handle the response in case of errors in GET/POST (when the server doesn't response)
	 */
	requestErrorCallback(response) {
		//return $q.reject("Error in HTTP request. Status: " + response.status + ", " + response.statusText);
	}
    
    isResponseXml(response) : boolean {
		return response.headers("Content-Type").indexOf(this.contentTypeXml) != -1;
	}
	
	isResponseJson(response) : boolean {
		return response.headers("Content-Type").indexOf(this.contentTypeJson) != -1;
	}

}