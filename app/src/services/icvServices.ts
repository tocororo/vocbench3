import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";
import {ARTURIResource} from "../utils/ARTResources";


@Injectable()
export class IcvServices {

    private serviceName = "ICV";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) {}

    /**
     * TODO: when refactored, this method should get also the scheme as parameter
     * Returns a list of records <concept-scheme>, where concept is a dangling skos:Concept, and scheme is the
	 * skos:ConceptScheme where concept is dangling 
     * @param limit max number of results to return
     */
    listDanglingConcepts(limit?: number) {
        console.log("[IcvServices] listDanglingConcepts");
        var params: any = {};
        if (limit != undefined) {
            params.limit = limit;
        }
        return this.httpMgr.doGet(this.serviceName, "listDanglingConcepts", params, this.oldTypeService);
    }
    
    /**
     * Detects cyclic hierarchical relations. Returns a list of records top, n1, n2 where 
	 * top is likely the cause of the cycle, n1 and n2 are vertex that belong to the cycle
     */
    listCyclicConcepts() {
        console.log("[IcvServices] listCyclicConcepts");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listCyclicConcepts", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of skos:ConceptScheme that have no top concept
     */
    listConceptSchemesWithNoTopConcept() {
        console.log("[IcvServices] listConceptSchemesWithNoTopConcept");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptSchemesWithNoTopConcept", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of skos:Concept that don't belong to any scheme 
     * @param limit max number of results to return
     */
    listConceptsWithNoScheme(limit?: number) {
        console.log("[IcvServices] listConceptsWithNoScheme");
        var params: any = {};
        if (limit != undefined) {
            params.limit = limit;
        }
        return this.httpMgr.doGet(this.serviceName, "listConceptsWithNoScheme", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of skos:Concept that are topConcept but have a broader 
     */
    listTopConceptsWithBroader() {
        console.log("[IcvServices] listTopConceptsWithBroader");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listTopConceptsWithBroader", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of records concept1-concept2-label-lang, of concepts that have the same skos:prefLabel
	 * in the same language
     */
    listConceptsWithSameSKOSPrefLabel() {
        console.log("[IcvServices] listConceptsWithSameSKOSPrefLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsWithSameSKOSPrefLabel", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of records concept1-concept2-label-lang, of concepts that have the same skosxl:prefLabel
	 * in the same language
     */
    listConceptsWithSameSKOSXLPrefLabel() {
        console.log("[IcvServices] listConceptsWithSameSKOSXLPrefLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsWithSameSKOSXLPrefLabel", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of records resource-lang, of concept that have a skos:altLabel for a lang but not a skos:prefLabel
     */
    listConceptsWithOnlySKOSAltLabel() {
        console.log("[IcvServices] listConceptsWithOnlySKOSAltLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsWithOnlySKOSAltLabel", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of records concept-lang, of concept that have a skosxl:altLabel for a lang but not a skosxl:prefLabel
     */
    listConceptsWithOnlySKOSXLAltLabel() {
        console.log("[IcvServices] listConceptsWithOnlySKOSXLAltLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsWithOnlySKOSXLAltLabel", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of concepts that have no skos:prefLabel
     */
    listConceptsWithNoSKOSPrefLabel() {
        console.log("[IcvServices] listConceptsWithNoSKOSPrefLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsWithNoSKOSPrefLabel", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of concepts that have no skosxl:prefLabel
     */
    listConceptsWithNoSKOSXLPrefLabel() {
        console.log("[IcvServices] listConceptsWithNoSKOSXLPrefLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsWithNoSKOSXLPrefLabel", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of conceptScheme that have no skos:prefLabel
     */
    listConceptSchemesWithNoSKOSPrefLabel() {
        console.log("[IcvServices] listConceptSchemesWithNoSKOSPrefLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptSchemesWithNoSKOSPrefLabel", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of conceptScheme that have no skosxl:prefLabel
     */
    listConceptSchemesWithNoSKOSXLPrefLabel() {
        console.log("[IcvServices] listConceptSchemesWithNoSKOSXLPrefLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptSchemesWithNoSKOSXLPrefLabel", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of pairs concept-lang of that concept that have more skos:prefLabel in a same language
     */
    listConceptsWithMultipleSKOSPrefLabel() {
        console.log("[IcvServices] listConceptsWithMultipleSKOSPrefLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsWithMultipleSKOSPrefLabel", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of records concept-lang of that concept that have more skosxl:prefLabel in a same language
     */
    listConceptsWithMultipleSKOSXLPrefLabel() {
        console.log("[IcvServices] listConceptsWithMultipleSKOSXLPrefLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsWithMultipleSKOSXLPrefLabel", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of records concept-labelPred-label of that concept that have a skos label without languageTag
     */
    listConceptsWithNoLanguageTagSKOSLabel() {
        console.log("[IcvServices] listConceptsWithNoLanguageTagSKOSLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsWithNoLanguageTagSKOSLabel", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of records concept-labelPred-xlabel-literal of that concept that have a skosxl:Label 
	 * without languageTag
     */
    listConceptsWithNoLanguageTagSKOSXLLabel() {
        console.log("[IcvServices] listConceptsWithNoLanguageTagSKOSXLLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsWithNoLanguageTagSKOSXLLabel", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of records concept-label-lang. A record like that means that the concept ?concept has 
	 * the same skos:prefLabel and skos:altLabel ?label in language ?lang
     */
    listConceptsWithOverlappedSKOSLabel() {
        console.log("[IcvServices] listConceptsWithOverlappedSKOSLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsWithOverlappedSKOSLabel", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of records concept-label-lang. A record like that means that the concept ?concept has 
	 * the same skosxl:prefLabel and skosxl:altLabel ?label in language ?lang
     */
    listConceptsWithOverlappedSKOSXLLabel() {
        console.log("[IcvServices] listConceptsWithOverlappedSKOSXLLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsWithOverlappedSKOSXLLabel", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of records concept-labelPred-label-lang. A record like that means that
	 * that the concept ?concept has the skos label ?label in language ?lang for the predicates ?labelPred that
	 * contains some extra whitespace (at the begin, at the end or multiple whitespace between two words)
     */
    listConceptsWithExtraWhitespaceInSKOSLabel() {
        console.log("[IcvServices] listConceptsWithExtraWhitespaceInSKOSLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsWithExtraWhitespaceInSKOSLabel", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of records concept-labelPred-label-lang. A record like that means that
	 * that the concept ?concept has the skosxl label ?label in language ?lang for the predicates ?labelPred that
	 * contains some extra whitespace (at the begin, at the end or multiple whitespace between two words)
     */
    listConceptsWithExtraWhitespaceInSKOSXLLabel() {
        console.log("[IcvServices] listConceptsWithExtraWhitespaceInSKOSXLLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsWithExtraWhitespaceInSKOSXLLabel", params, this.oldTypeService);
    }
    
    /**
     * Returns a list of skos:Concept that have redundant hierarchical relations
     */
    listHierarchicallyRedundantConcepts() {
        console.log("[IcvServices] listHierarchicallyRedundantConcepts");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listHierarchicallyRedundantConcepts", params, this.oldTypeService);
    }
    
    /**
     * Returns resources which URI contains white spaces
     * @param limit max number of results to return
     */
    listResourcesURIWithSpace(limit?: number) {
        console.log("[IcvServices] listResourcesURIWithSpace");
        var params: any = {};
        if (limit != undefined) {
            params.limit = limit;
        }
        return this.httpMgr.doGet(this.serviceName, "listResourcesURIWithSpace", params, this.oldTypeService);
    }
    
}