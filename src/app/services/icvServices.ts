import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {ARTURIResource, ARTResource, ARTNode, ARTLiteral} from "../models/ARTResources";
import {Deserializer} from "../utils/Deserializer";

@Injectable()
export class IcvServices {

    private serviceName = "ICV";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) {}

    /**
     * Returns a list of records <concept>, where concept is a dangling skos:Concept in the given
     * skos:ConceptScheme 
     * @param scheme scheme where to get the dangling concept
     * @param limit max number of results to return
     */
    listDanglingConcepts(scheme: ARTURIResource, limit?: number) {
        console.log("[IcvServices] listDanglingConcepts");
        var params: any = {
            scheme: scheme.getURI()
        };
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

    //=============================
    //======== LABEL CHECKS ========
    //=============================
    
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
     * Returns a list of records resource-lang, of concept or conceptScheme that have a skos:altLabel for a lang
     * but not a skos:prefLabel
     */
    listResourcesWithOnlySKOSAltLabel() {
        console.log("[IcvServices] listResourcesWithOnlySKOSAltLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithOnlySKOSAltLabel", params, this.oldTypeService).map(
            stResp => {
                var recordElemColl: Element[] = stResp.getElementsByTagName("record");
                var records: any[] = [];
                for (var i = 0; i < recordElemColl.length; i++) {
                    var resource = Deserializer.createURI(recordElemColl[i]);
                    var lang = recordElemColl[i].getElementsByTagName("lang")[0].textContent;
                    var langRes = new ARTLiteral(lang);
                    langRes.setLang(lang);
                    records.push({resource: resource, lang: langRes});
                }
                return records;
            }
        );
    }
    
    /**
     * Returns a list of records resource-lang, of concept or conceptScheme that have a skosxl:altLabel for a lang
     * but not a skosxl:prefLabel
     */
    listResourcesWithOnlySKOSXLAltLabel() {
        console.log("[IcvServices] listResourcesWithOnlySKOSXLAltLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithOnlySKOSXLAltLabel", params, this.oldTypeService).map(
            stResp => {
                var recordElemColl: Element[] = stResp.getElementsByTagName("record");
                var records: any[] = [];
                for (var i = 0; i < recordElemColl.length; i++) {
                    var resource = Deserializer.createURI(recordElemColl[i]);
                    var lang = recordElemColl[i].getElementsByTagName("lang")[0].textContent;
                    var langRes = new ARTLiteral(lang);
                    langRes.setLang(lang);
                    records.push({resource: resource, lang: langRes});
                }
                return records;
            }
        );
    }
    
    /**
     * Returns a list of concepts or scheme that have no skos:prefLabel
     */
    listResourcesWithNoSKOSPrefLabel() {
        console.log("[IcvServices] listResourcesWithNoSKOSPrefLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithNoSKOSPrefLabel", params, this.oldTypeService).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }
    
    /**
     * Returns a list of concepts or scheme that have no skosxl:prefLabel
     */
    listResourcesWithNoSKOSXLPrefLabel() {
        console.log("[IcvServices] listResourcesWithNoSKOSXLPrefLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithNoSKOSXLPrefLabel", params, this.oldTypeService).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
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
     * Returns a list of records resource-predicate-label of concepts and conceptSchemes that have a
     * skos label without languageTag
     */
    listResourcesWithNoLanguageTagSKOSLabel() {
        console.log("[IcvServices] listResourcesWithNoLanguageTagSKOSLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithNoLanguageTagSKOSLabel", params, this.oldTypeService).map(
            stResp => {
                var records: any[] = [];
                var recordElemColl = stResp.getElementsByTagName("record");
                for (var i = 0; i < recordElemColl.length; i++) {
                    var resource: ARTURIResource = Deserializer.createURI(recordElemColl[i].getElementsByTagName("resource")[0].children[0]);
                    var predicate: ARTURIResource = Deserializer.createURI(recordElemColl[i].getElementsByTagName("predicate")[0].children[0]);
                    var label: ARTLiteral = Deserializer.createLiteral(recordElemColl[i].getElementsByTagName("object")[0].children[0]);
                    records.push({resource: resource, predicate: predicate, label: label});
                }
                return records;
            }
        );
    }
    
    /**
     * Returns a list of records resource-predicate-label of concepts and conceptSchemes that have a
     * skosxl label without languageTag
     */
    listResourcesWithNoLanguageTagSKOSXLLabel() {
        console.log("[IcvServices] listResourcesWithNoLanguageTagSKOSXLLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithNoLanguageTagSKOSXLLabel", params, this.oldTypeService).map(
            stResp => {
                var records: any[] = [];
                var recordElemColl = stResp.getElementsByTagName("record");
                for (var i = 0; i < recordElemColl.length; i++) {
                    var resource: ARTURIResource = Deserializer.createURI(recordElemColl[i].getElementsByTagName("resource")[0].children[0]);
                    var predicate: ARTURIResource = Deserializer.createURI(recordElemColl[i].getElementsByTagName("predicate")[0].children[0]);
                    var label: ARTResource = Deserializer.createRDFResource(recordElemColl[i].getElementsByTagName("object")[0].children[0]);
                    records.push({resource: resource, predicate: predicate, label: label});
                }
                return records;
            }
        );
    }
    
    /**
     * Returns a list of records {resource: ARTURIResource, label: ARTLiteral}. A record like that means that the resource has 
	 * the same skos:prefLabel and skos:altLabel in the same language
     */
    listResourcesWithOverlappedSKOSLabel() {
        console.log("[IcvServices] listResourcesWithOverlappedSKOSLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithOverlappedSKOSLabel", params, this.oldTypeService).map(
            stResp => {
                var recordElemColl: Element[] = stResp.getElementsByTagName("record");
                var records: any[] = [];
                for (var i = 0; i < recordElemColl.length; i++) {
                    var resource: ARTURIResource = Deserializer.createURI(recordElemColl[i]);
                    var label: ARTLiteral = Deserializer.createLiteral(recordElemColl[i]);
                    records.push({resource: resource, label: label});
                }
                return records;
            }
        );
    }
    
    /**
     * Returns a list of records {resource: ARTURIResource, label: ARTLiteral}. A record like that means that the resource has 
	 * the same skosxl:prefLabel and skosxl:altLabel in the same language
     */
    listResourcesWithOverlappedSKOSXLLabel() {
        console.log("[IcvServices] listResourcesWithOverlappedSKOSXLLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithOverlappedSKOSXLLabel", params, this.oldTypeService).map(
            stResp => {
                var recordElemColl: Element[] = stResp.getElementsByTagName("record");
                var records: any[] = [];
                for (var i = 0; i < recordElemColl.length; i++) {
                    var resource: ARTURIResource = Deserializer.createURI(recordElemColl[i]);
                    var label: ARTLiteral = Deserializer.createLiteral(recordElemColl[i]);
                    records.push({resource: resource, label: label});
                }
                return records;
            }
        );
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
     * Returns a list of dangling skosxl:Label, namely the skosxl:Label not linked with any concept
     */
    listDanglingXLabels() {
        console.log("[IcvServices] listDanglingXLabels");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listDanglingXLabels", params, this.oldTypeService).map(
            stResp => {
                return <ARTResource[]>Deserializer.createRDFNodeArray(stResp);
            }
        );
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
    
    //=============================
    //======== QUICK FIXES ========
    //=============================
    
    /**
     * Quick fix for dangling concepts. Set all dangling concepts as topConceptOf the given scheme
	 * @param scheme
     */
    setAllDanglingAsTopConcept(scheme: ARTURIResource) {
        console.log("[IcvServices] setAllDanglingAsTopConcept");
        var params: any = {
            scheme: scheme.getURI()
        };
        return this.httpMgr.doGet(this.serviceName, "setAllDanglingAsTopConcept", params, this.oldTypeService);
    }
    
    /**
     * Quick fix for dangling concepts. Set the given broader for all dangling concepts in the given scheme 
	 * @param scheme
	 * @param broader
     */
    setBroaderForAllDangling(scheme: ARTURIResource, broader: ARTURIResource) {
        console.log("[IcvServices] setBroaderForAllDangling");
        var conceptsUri: string[] = []
        var params: any = {
            scheme: scheme.getURI(),
            broader: broader.getURI()
        };
        return this.httpMgr.doGet(this.serviceName, "setBroaderForAllDangling", params, this.oldTypeService);
    }
    
    /**
     * Quick fix for dangling concepts. Removes all dangling concepts from the given scheme
	 * @param scheme
     */
    removeAllDanglingFromScheme(scheme: ARTURIResource) {
        console.log("[IcvServices] removeAllDanglingFromScheme");
        var params: any = {
            scheme: scheme.getURI()
        };
        return this.httpMgr.doGet(this.serviceName, "removeAllDanglingFromScheme", params, this.oldTypeService);
    }

    /**
     * Quick fix for dangling concepts. Deletes all dangling concepts of the given scheme
	 * @param scheme
     */
    deleteAllDanglingConcepts(scheme: ARTURIResource) {
        console.log("[IcvServices] deleteAllDanglingConcepts");
        var params: any = {
            scheme: scheme.getURI()
        };
        return this.httpMgr.doGet(this.serviceName, "deleteAllDanglingConcepts", params, this.oldTypeService);
    }
    
    /**
     * Quick fix for concepts in no scheme. Add all concepts without scheme to the given scheme
	 * @param scheme
     */
    addAllConceptsToScheme(scheme: ARTURIResource) {
        console.log("[IcvServices] addAllConceptsToScheme");
        var params: any = {
            scheme: scheme.getURI()
        };
        return this.httpMgr.doGet(this.serviceName, "addAllConceptsToScheme", params, this.oldTypeService);
    }
    
    /**
	 * Fix for topConcept with broader. Remove all the broader relation in the given scheme of the given concept.
	 * @param concept
	 * @param scheme
	 */
	removeBroadersToConcept(concept: ARTURIResource, scheme: ARTURIResource) {
        console.log("[IcvServices] removeBroadersToConcept");
        var params: any = {
            concept: concept.getURI(),
            scheme: scheme.getURI()
        };
        return this.httpMgr.doGet(this.serviceName, "removeBroadersToConcept", params, this.oldTypeService);
    }
    
    /**
	 * Quick fix for topConcept with broader. Remove all the broader (or narrower) relation in the 
	 * of top concepts with broader (in the same scheme).
	 */
	removeBroadersToAllConcepts() {
        console.log("[IcvServices] removeBroadersToAllConcepts");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "removeBroadersToAllConcepts", params, this.oldTypeService);
    } 

    /**
     * Quick fix for topConcept with broader. Remove as topConceptOf all the topConcept with broader.
     */
    removeAllAsTopConceptsWithBroader() {
        console.log("[IcvServices] removeAllAsTopConceptsWithBroader");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "removeAllAsTopConceptsWithBroader", params, this.oldTypeService);
    }

    /**
	 * Quick fix for hierarchical redundancy. Remove narrower/broader redundant relations.
	 */
	removeAllHierarchicalRedundancy() {
        console.log("[IcvServices] removeAllHierarchicalRedundancy");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "removeAllHierarchicalRedundancy", params, this.oldTypeService);
    }
    
    /**
     * Quick fix for dangling xLabel. Deletes all the dangling labels.
     */
    deleteAllDanglingXLabel() {
        console.log("[IcvServices] deleteAllDanglingXLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "deleteAllDanglingXLabel", params, this.oldTypeService);
    }

    /**
     * Fix for dangling xLabel. Links the dangling xLabel to the given concept through the given predicate 
	 * @param concept
	 * @param xlabelPred
	 * @param xlabel
     */
    setDanglingXLabel(concept: ARTURIResource, xlabelPred: ARTURIResource, xlabel: ARTResource) {
        console.log("[IcvServices] setDanglingXLabel");
        var params: any = {
            concept: concept.getURI(),
            xlabelPred: xlabelPred.getURI(),
            xlabel: xlabel.getNominalValue()
        };
        return this.httpMgr.doGet(this.serviceName, "setDanglingXLabel", params, this.oldTypeService);
    }

}