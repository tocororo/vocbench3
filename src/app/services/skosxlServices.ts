import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ARTLiteral, ARTResource, ARTURIResource, RDFTypesEnum } from "../models/ARTResources";
import { Deserializer } from "../utils/Deserializer";
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { VBEventHandler } from "../utils/VBEventHandler";

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
        var params: any = {
            concept: concept,
            lang: lang
        };
        return this.httpMgr.doGet(this.serviceName, "getPrefLabel", params).pipe(
            map(stResp => {
                return Deserializer.createRDFResource(stResp[0]);
            })
        );
    }

    /**
     * Sets a preferred label to the given concept (or scheme).
     * @param concept
     * @param literal
     * @param labelCls
     * @param checkExistingAltLabel enables the check of clash between existing labels and the new created
     * @param mode available values: uri or bnode
     */
    setPrefLabel(concept: ARTURIResource, literal: ARTLiteral, labelCls?: ARTURIResource, checkExistingAltLabel?: boolean, 
            mode: string = RDFTypesEnum.uri) {
        var params: any = {
            concept: concept,
            literal: literal,
            mode: mode,
        };
        if (labelCls != null) {
            params.labelCls = labelCls;
        }
        if (checkExistingAltLabel != null) {
            params.checkExistingAltLabel = checkExistingAltLabel;
        }
        var options: VBRequestOptions = new VBRequestOptions({
            errorAlertOpt: { 
                show: true, 
                exceptionsToSkip: [
                    'it.uniroma2.art.semanticturkey.exceptions.PrefAltLabelClashException',
                    'it.uniroma2.art.semanticturkey.exceptions.BlacklistForbiddendException'
                ] 
            } 
        });
        return this.httpMgr.doPost(this.serviceName, "setPrefLabel", params, options);
    }

    /**
     * Removes a preferred label from the given concept (or scheme).
     * @param concept 
     * @param xlabel label to remove
     */
    removePrefLabel(concept: ARTURIResource, xlabel: ARTResource) {
        var params: any = {
            concept: concept,
            xlabel: xlabel,
        };
        return this.httpMgr.doPost(this.serviceName, "removePrefLabel", params);
    }

    /**
     * Returns the alternative skosxl labels for the given concept in the given language
     * @param concept
     * @param lang
     */
    getAltLabels(concept: ARTURIResource, lang: string) {
        var params: any = {
            concept: concept,
            lang: lang,
        };
        return this.httpMgr.doGet(this.serviceName, "getAltLabels", params).pipe(
            map(stResp => {
                return Deserializer.createRDFNodeArray(stResp);
            })
        );
    }

    /**
     * Adds an alternative label to the given concept (or scheme)
     * @param concept
     * @param literal
     * @param labelCls
     * @param mode available values: uri or bnode
     */
    addAltLabel(concept: ARTURIResource, literal: ARTLiteral, labelCls?: ARTURIResource, mode: string = RDFTypesEnum.uri) {
        var params: any = {
            concept: concept,
            literal: literal,
            mode: mode,
        };
        if (labelCls != null) {
            params.labelCls = labelCls;
        }
        let options: VBRequestOptions = new VBRequestOptions({
            errorAlertOpt: { 
                show: true, 
                exceptionsToSkip: ['it.uniroma2.art.semanticturkey.exceptions.BlacklistForbiddendException'] 
            } 
        });
        return this.httpMgr.doPost(this.serviceName, "addAltLabel", params, options);
    }

    /**
     * Removes an alternative label from the given concept (or scheme)
     * @param concept 
     * @param xlabel label to remove
     */
    removeAltLabel(concept: ARTURIResource, xlabel: ARTResource) {
        var params: any = {
            concept: concept,
            xlabel: xlabel,
        };
        return this.httpMgr.doPost(this.serviceName, "removeAltLabel", params);
    }

    /**
     * Adds an hidden label to the given concept (or scheme)
     * @param concept
     * @param literal
     * @param labelCls
     * @param mode available values: uri or bnode
     */
    addHiddenLabel(concept: ARTURIResource, literal: ARTLiteral, labelCls?: ARTURIResource, mode: string = RDFTypesEnum.uri) {
        var params: any = {
            concept: concept,
            literal: literal,
            mode: mode,
        };
        if (labelCls != null) {
            params.labelCls = labelCls;
        }
        let options: VBRequestOptions = new VBRequestOptions({
            errorAlertOpt: { 
                show: true, 
                exceptionsToSkip: ['it.uniroma2.art.semanticturkey.exceptions.BlacklistForbiddendException'] 
            } 
        });
        return this.httpMgr.doPost(this.serviceName, "addHiddenLabel", params, options);
    }

    /**
     * Removes an hidden label from the given concept (or scheme)
     * @param concept 
     * @param xlabel label to remove
     */
    removeHiddenLabel(concept: ARTURIResource, xlabel: ARTResource) {
        var params: any = {
            concept: concept,
            xlabel: xlabel,
        };
        return this.httpMgr.doPost(this.serviceName, "removeHiddenLabel", params);
    }

    /**
     * Updates the info (literal form or language) about an xLabel
     * @param xlabel
     * @param label
     * @param lang
     */
    changeLabelInfo(xlabel: ARTResource, literal: ARTLiteral) {
        var params: any = {
            xlabel: xlabel,
            literal: literal,
        };
        return this.httpMgr.doPost(this.serviceName, "changeLabelInfo", params);
    }

    /**
     * Set a preferred label as alternative.
     * @param concept
     * @param xLabel
     */
    prefToAtlLabel(concept: ARTURIResource, xLabel: ARTResource) {
        var params: any = {
            concept: concept,
            xlabelURI: xLabel
        };
        return this.httpMgr.doPost(this.serviceName, "prefToAtlLabel", params);
    }

    /**
     * Set an alternative label as preferred.
     * @param concept
     * @param xLabel
     */
    altToPrefLabel(concept: ARTURIResource, xLabel: ARTResource) {
        var params: any = {
            concept: concept,
            xlabelURI: xLabel
        };
        return this.httpMgr.doPost(this.serviceName, "altToPrefLabel", params);
    }

}