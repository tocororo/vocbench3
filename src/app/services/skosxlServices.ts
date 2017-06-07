import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { VBEventHandler } from "../utils/VBEventHandler";
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { ARTResource, ARTURIResource, ARTLiteral, ResAttribute, RDFResourceRolesEnum } from "../models/ARTResources";

@Injectable()
export class SkosxlServices {

    private serviceName = "SKOSXL";


    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    /**
     * Returns the preferred skosxl label for the given concept in the given language
     * @param concept
     * @param lang
     */
    getPrefLabel(concept: ARTURIResource, lang: string) {
        console.log("[SkosxlServices] getPrefLabel");
        var params: any = {
            concept: concept,
            lang: lang
        };
        return this.httpMgr.doGet(this.serviceName, "getPrefLabel", params, true).map(
            stResp => {
                return Deserializer.createRDFResource(stResp[0]);
            }
        );
    }

    /**
     * Sets a preferred label to the given concept (or scheme).
     * @param concept
     * @param literal
     * @param mode available values: uri or bnode
     */
    setPrefLabel(concept: ARTURIResource, literal: ARTLiteral, mode: string) {
        console.log("[SkosxlServices] setPrefLabel");
        var params: any = {
            concept: concept,
            literal: literal,
            mode: mode,
        };
        return this.httpMgr.doPost(this.serviceName, "setPrefLabel", params, true);
    }

    /**
     * Removes a preferred label from the given concept (or scheme).
     * @param concept 
     * @param xlabel label to remove
     */
    removePrefLabel(concept: ARTURIResource, xlabel: ARTResource) {
        console.log("[SkosxlServices] removePrefLabel");
        var params: any = {
            concept: concept,
            xlabel: xlabel,
        };
        return this.httpMgr.doPost(this.serviceName, "removePrefLabel", params, true);
    }

    /**
     * Returns the alternative skosxl labels for the given concept in the given language
     * @param concept
     * @param lang
     */
    getAltLabels(concept: ARTURIResource, lang: string) {
        console.log("[SkosxlServices] getAltLabels");
        var params: any = {
            concept: concept,
            lang: lang,
        };
        return this.httpMgr.doGet(this.serviceName, "getAltLabels", params, true).map(
            stResp => {
                return Deserializer.createRDFNodeArray(stResp);
            }
        );
    }

    /**
     * Adds an alternative label to the given concept (or scheme)
     * @param concept
     * @param literal
     * @param mode available values: uri or bnode
     */
    addAltLabel(concept: ARTURIResource, literal: ARTLiteral, mode: string) {
        console.log("[SkosxlServices] addAltLabel");
        var params: any = {
            concept: concept,
            literal: literal,
            mode: mode,
        };
        return this.httpMgr.doPost(this.serviceName, "addAltLabel", params, true);
    }

    /**
     * Removes an alternative label from the given concept (or scheme)
     * @param concept 
     * @param xlabel label to remove
     */
    removeAltLabel(concept: ARTURIResource, xlabel: ARTResource) {
        console.log("[SkosxlServices] removeAltLabel");
        var params: any = {
            concept: concept,
            xlabel: xlabel,
        };
        return this.httpMgr.doPost(this.serviceName, "removeAltLabel", params, true);
    }

    /**
     * Adds an hidden label to the given concept (or scheme)
     * @param concept
     * @param literal
     * @param mode available values: uri or bnode
     */
    addHiddenLabel(concept: ARTURIResource, literal: ARTLiteral, mode: string) {
        console.log("[SkosxlServices] addHiddenLabel");
        var params: any = {
            concept: concept,
            literal: literal,
            mode: mode,
        };
        return this.httpMgr.doPost(this.serviceName, "addHiddenLabel", params, true);
    }

    /**
     * Removes an hidden label from the given concept (or scheme)
     * @param concept 
     * @param xlabel label to remove
     */
    removeHiddenLabel(concept: ARTURIResource, xlabel: ARTResource) {
        console.log("[SkosxlServices] removeHiddenLabel");
        var params: any = {
            concept: concept,
            xlabel: xlabel,
        };
        return this.httpMgr.doPost(this.serviceName, "removeHiddenLabel", params, true);
    }

    /**
     * Updates the info (literal form or language) about an xLabel
     * @param xlabel
     * @param label
     * @param lang
     */
    changeLabelInfo(xlabel: ARTResource, literal: ARTLiteral) {
        console.log("[SkosxlServices] changeLabelInfo");
        var params: any = {
            xlabel: xlabel,
            literal: literal,
        };
        return this.httpMgr.doPost(this.serviceName, "changeLabelInfo", params, true);
    }

    /**
     * Set a preferred label as alternative.
     * @param concept
     * @param xLabel
     */
    prefToAtlLabel(concept: ARTURIResource, xLabel: ARTResource) {
        console.log("[SkosxlServices] prefToAtlLabel");
        var params: any = {
            concept: concept,
            xlabelURI: xLabel
        };
        return this.httpMgr.doPost(this.serviceName, "prefToAtlLabel", params, true);
    }

    /**
     * Set an alternative label as preferred.
     * @param concept
     * @param xLabel
     */
    altToPrefLabel(concept: ARTURIResource, xLabel: ARTResource) {
        console.log("[SkosxlServices] altToPrefLabel");
        var params: any = {
            concept: concept,
            xlabelURI: xLabel
        };
        return this.httpMgr.doPost(this.serviceName, "altToPrefLabel", params, true);
    }

}