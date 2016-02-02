import {Injectable} from 'angular2/core';
import {Http} from 'angular2/http';
import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class SkosxlServices {

    private serviceName = "skosxl";
    private oldTypeService = true;

    constructor(private http: Http, private httpMgr: HttpManager) { }
    
    //Concept services 
    
    //Scheme services
    
    //Label services
    
    setPrefLabel(concept: string, label: string, lang: string, mode: string) {
        console.log("[SkosxlServices] setPrefLabel");
        var params: any = {
            concept: concept,
            label: label,
            lang: lang,
            mode: mode,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "setPrefLabel", params, this.oldTypeService);
    }
    
    removePrefLabel(concept: string, label: string, lang?: string) {
        console.log("[SkosxlServices] removePrefLabel");
        var params: any = {
            concept: concept,
            label: label,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "removePrefLabel", params, this.oldTypeService);
	}
    
    addAltLabel(concept: string, label: string, lang: string, mode: string) {
        console.log("[SkosxlServices] addAltLabel");
        var params: any = {
            concept: concept,
            label: label,
            lang: lang,
            mode: mode,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "addAltLabel", params, this.oldTypeService);
    }
    
    removeAltLabel(concept: string, label: string, lang?: string) {
        console.log("[SkosxlServices] removeAltLabel");
        var params: any = {
            concept: concept,
            label: label,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "removeAltLabel", params, this.oldTypeService);
	}
    
    addHiddenLabel(concept: string, label: string, lang: string, mode: string) {
        console.log("[SkosxlServices] addHiddenLabel");
        var params: any = {
            concept: concept,
            label: label,
            lang: lang,
            mode: mode,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "addHiddenLabel", params, this.oldTypeService);
    }
    
    removeHiddenLabel(concept: string, label: string, lang?: string) {
        console.log("[SkosxlServices] removeHiddenLabel");
        var params: any = {
            concept: concept,
            label: label,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "removeHiddenLabel", params, this.oldTypeService);
	}

}