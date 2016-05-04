import {Injectable} from '@angular/core';
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
    
    /**
     * Sets a preferred label to the given concept
     * @param concept
     * @param label lexical value of the label
     * @param lang
     * @param mode available values: uri or bnode
     */
    setPrefLabel(concept: ARTURIResource, label: string, lang: string, mode: string) {
        console.log("[SkosxlServices] setPrefLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
            lang: lang,
            mode: mode,
        };
        return this.httpMgr.doGet(this.serviceName, "setPrefLabel", params, this.oldTypeService);
    }
    
    /**
     * Removes a preferred label from the given concept
     * @param concept 
     * @param label label to remove
     * @param lang
     */
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
    
    /**
     * Adds an alternative label to the given concept
     * @param concept
     * @param label lexical value of the label
     * @param lang
     * @param mode available values: uri or bnode
     */
    addAltLabel(concept: ARTURIResource, label: string, lang: string, mode: string) {
        console.log("[SkosxlServices] addAltLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
            lang: lang,
            mode: mode,
        };
        return this.httpMgr.doGet(this.serviceName, "addAltLabel", params, this.oldTypeService);
    }
    
    /**
     * Removes an alternative label from the given concept
     * @param concept 
     * @param label label to remove
     * @param lang
     */
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
    
    /**
     * Adds an hidden label to the given concept
     * @param concept
     * @param label lexical value of the label
     * @param lang
     * @param mode available values: uri or bnode
     */
    addHiddenLabel(concept: ARTURIResource, label: string, lang: string, mode: string) {
        console.log("[SkosxlServices] addHiddenLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
            lang: lang,
            mode: mode,
        };
        return this.httpMgr.doGet(this.serviceName, "addHiddenLabel", params, this.oldTypeService);
    }
    
    /**
     * Removes an hidden label from the given concept
     * @param concept 
     * @param label label to remove
     * @param lang
     */
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