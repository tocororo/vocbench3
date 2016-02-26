import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";
import {ARTURIResource} from "../utils/ARTResources";

@Injectable()
export class SkosxlServices {

    private serviceName = "skosxl";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager) { }
    
    //Concept services 
    
    //Scheme services
    
    //Label services
    
    setPrefLabel(concept: ARTURIResource, label: string, lang: string, mode: string) {
        console.log("[SkosxlServices] setPrefLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
            lang: lang,
            mode: mode,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "setPrefLabel", params, this.oldTypeService);
    }
    
    removePrefLabel(concept: ARTURIResource, label: string, lang?: string) {
        console.log("[SkosxlServices] removePrefLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "removePrefLabel", params, this.oldTypeService);
	}
    
    addAltLabel(concept: ARTURIResource, label: string, lang: string, mode: string) {
        console.log("[SkosxlServices] addAltLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
            lang: lang,
            mode: mode,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "addAltLabel", params, this.oldTypeService);
    }
    
    removeAltLabel(concept: ARTURIResource, label: string, lang?: string) {
        console.log("[SkosxlServices] removeAltLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "removeAltLabel", params, this.oldTypeService);
	}
    
    addHiddenLabel(concept: ARTURIResource, label: string, lang: string, mode: string) {
        console.log("[SkosxlServices] addHiddenLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
            lang: lang,
            mode: mode,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "addHiddenLabel", params, this.oldTypeService);
    }
    
    removeHiddenLabel(concept: ARTURIResource, label: string, lang?: string) {
        console.log("[SkosxlServices] removeHiddenLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "removeHiddenLabel", params, this.oldTypeService);
	}

}