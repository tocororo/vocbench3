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
    
	constructor(public http:Http, private vocbenchCtx:VocbenchCtx) {}
    
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
            .map(res => {
                if (this.isResponseXml(res)) {
                    var parser = new DOMParser();
			        var stResp = parser.parseFromString(res.text(), "application/xml"); 
                    return stResp;     
                } else if (this.isResponseJson(res)) {
                    return res.json();
                }
            });
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
        this.http.post(url, postData, { headers: headers })
            .map(res => {
                if (this.isResponseXml(res)) {
                    var parser = new DOMParser();
			        var stResp = parser.parseFromString(res.text(), "application/xml"); 
                    return stResp;     
                } else if (this.isResponseJson(res)) {
                    return res.json();
                }
            });
    }
    
    isResponseXml(response) : boolean {
		return response.headers.get("Content-Type").indexOf(this.contentTypeXml) != -1;
	}
	
	isResponseJson(response) : boolean {
		return response.headers.get("Content-Type").indexOf(this.contentTypeJson) != -1;
	}

}