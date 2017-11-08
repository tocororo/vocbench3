import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { ARTURIResource, ARTResource, ARTNode, ARTLiteral, RDFResourceRolesEnum } from "../models/ARTResources";
import { Deserializer } from "../utils/Deserializer";

@Injectable()
export class IcvServices {

    private serviceName = "ICV";

    constructor(private httpMgr: HttpManager) { }

    //=================================
    //======= STRUCTURAL CHECKS =======
    //=================================

    /**
     * Returns a list of dangling skos:Concept in the given skos:ConceptScheme 
     * @param scheme scheme where to get the dangling concept
     */
    listDanglingConcepts(scheme: ARTURIResource): Observable<ARTURIResource[]> {
        console.log("[IcvServices] listDanglingConcepts");
        var params: any = {
            scheme: scheme
        };
        return this.httpMgr.doGet(this.serviceName, "listDanglingConcepts", params, true).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * Detects cyclic hierarchical relations. Returns a list of records top, n1, n2 where 
	 * top is likely the cause of the cycle, n1 and n2 are vertex that belong to the cycle
     */
    // listCyclicConcepts() {
    //     console.log("[IcvServices] listCyclicConcepts");
    //     var params: any = {};
    //     return this.httpMgr.doGet(this.serviceName, "listCyclicConcepts", params);
    // }

    /**
     * Returns a list of skos:ConceptScheme that have no top concept
     */
    listConceptSchemesWithNoTopConcept(): Observable<ARTURIResource[]> {
        console.log("[IcvServices] listConceptSchemesWithNoTopConcept");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptSchemesWithNoTopConcept", params, true).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * Returns a list of skos:Concept that don't belong to any scheme 
     */
    listConceptsWithNoScheme(): Observable<ARTURIResource[]> {
        console.log("[IcvServices] listConceptsWithNoScheme");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsWithNoScheme", params, true).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * Returns a list of skos:Concept that are topConcept but have a broader 
     */
    listTopConceptsWithBroader(): Observable<{concept: ARTURIResource, scheme: ARTURIResource}[]> {
        console.log("[IcvServices] listTopConceptsWithBroader");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listTopConceptsWithBroader", params, true).map(
            stResp => {
                var records: {concept: ARTURIResource, scheme: ARTURIResource}[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    records.push({
                        concept: new ARTURIResource(stResp[i].concept, stResp[i].concept, RDFResourceRolesEnum.concept),
                        scheme: new ARTURIResource(stResp[i].scheme, stResp[i].scheme, RDFResourceRolesEnum.conceptScheme),
                    });
                }
                return records;
            }
        );
    }

    /**
     * Returns a list of skos:Concept that have redundant hierarchical relations
     */
    listHierarchicallyRedundantConcepts() {
        console.log("[IcvServices] listHierarchicallyRedundantConcepts");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listHierarchicallyRedundantConcepts", params);
    }

    //=============================
    //======== LABEL CHECKS ========
    //=============================

    /**
     * Returns a list of records concept1-concept2-label-lang, of concepts that have the same skos:prefLabel
	 * in the same language
     */
    // listConceptsWithSameSKOSPrefLabel() {
    //     console.log("[IcvServices] listConceptsWithSameSKOSPrefLabel");
    //     var params: any = {};
    //     return this.httpMgr.doGet(this.serviceName, "listConceptsWithSameSKOSPrefLabel", params);
    // }

    // /**
    //  * Returns a list of records concept1-concept2-label-lang, of concepts that have the same skosxl:prefLabel
	//  * in the same language
    //  */
    // listConceptsWithSameSKOSXLPrefLabel() {
    //     console.log("[IcvServices] listConceptsWithSameSKOSXLPrefLabel");
    //     var params: any = {};
    //     return this.httpMgr.doGet(this.serviceName, "listConceptsWithSameSKOSXLPrefLabel", params);
    // }

    /**
     * Returns a list of records resource-lang, of concept or conceptScheme that have a skos:altLabel for a lang
     * but not a skos:prefLabel
     */
    listResourcesWithOnlySKOSAltLabel() {
        console.log("[IcvServices] listResourcesWithOnlySKOSAltLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithOnlySKOSAltLabel", params).map(
            stResp => {
                var recordElemColl: Element[] = stResp.getElementsByTagName("record");
                var records: any[] = [];
                for (var i = 0; i < recordElemColl.length; i++) {
                    var resource = Deserializer.createURI(recordElemColl[i]);
                    var lang = recordElemColl[i].getElementsByTagName("lang")[0].textContent;
                    var langRes = new ARTLiteral(lang);
                    langRes.setLang(lang);
                    records.push({ resource: resource, lang: langRes });
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
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithOnlySKOSXLAltLabel", params).map(
            stResp => {
                var recordElemColl: Element[] = stResp.getElementsByTagName("record");
                var records: any[] = [];
                for (var i = 0; i < recordElemColl.length; i++) {
                    var resource = Deserializer.createURI(recordElemColl[i]);
                    var lang = recordElemColl[i].getElementsByTagName("lang")[0].textContent;
                    var langRes = new ARTLiteral(lang);
                    langRes.setLang(lang);
                    records.push({ resource: resource, lang: langRes });
                }
                return records;
            }
        );
    }

    /**
     * Returns a list of concepts or scheme that have no skos:prefLabel
     */
    listResourcesWithNoSKOSPrefLabel(): Observable<ARTResource[]> {
        console.log("[IcvServices] listResourcesWithNoSKOSPrefLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithNoSKOSPrefLabel", params, true).map(
            stResp => {
                return Deserializer.createResourceArray(stResp);
            }
        );
    }

    /**
     * Returns a list of concepts or scheme that have no skosxl:prefLabel
     */
    listResourcesWithNoSKOSXLPrefLabel(): Observable<ARTResource[]> {
        console.log("[IcvServices] listResourcesWithNoSKOSXLPrefLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithNoSKOSXLPrefLabel", params, true).map(
            stResp => {
                return Deserializer.createResourceArray(stResp);
            }
        );
    }

    // /**
    //  * Returns a list of pairs concept-lang of that concept that have more skos:prefLabel in a same language
    //  */
    // listConceptsWithMultipleSKOSPrefLabel() {
    //     console.log("[IcvServices] listConceptsWithMultipleSKOSPrefLabel");
    //     var params: any = {};
    //     return this.httpMgr.doGet(this.serviceName, "listConceptsWithMultipleSKOSPrefLabel", params);
    // }

    // /**
    //  * Returns a list of records concept-lang of that concept that have more skosxl:prefLabel in a same language
    //  */
    // listConceptsWithMultipleSKOSXLPrefLabel() {
    //     console.log("[IcvServices] listConceptsWithMultipleSKOSXLPrefLabel");
    //     var params: any = {};
    //     return this.httpMgr.doGet(this.serviceName, "listConceptsWithMultipleSKOSXLPrefLabel", params);
    // }

    /**
     * Returns a list of records resource-predicate-label of concepts and conceptSchemes that have a
     * skos label without languageTag
     */
    listResourcesWithNoLanguageTagSKOSLabel() {
        console.log("[IcvServices] listResourcesWithNoLanguageTagSKOSLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithNoLanguageTagSKOSLabel", params).map(
            stResp => {
                var records: any[] = [];
                var recordElemColl = stResp.getElementsByTagName("record");
                for (var i = 0; i < recordElemColl.length; i++) {
                    var resource: ARTURIResource = Deserializer.createURI(recordElemColl[i].getElementsByTagName("resource")[0].children[0]);
                    var predicate: ARTURIResource = Deserializer.createURI(recordElemColl[i].getElementsByTagName("predicate")[0].children[0]);
                    var label: ARTLiteral = Deserializer.createLiteral(recordElemColl[i].getElementsByTagName("object")[0].children[0]);
                    records.push({ resource: resource, predicate: predicate, label: label });
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
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithNoLanguageTagSKOSXLLabel", params).map(
            stResp => {
                var records: any[] = [];
                var recordElemColl = stResp.getElementsByTagName("record");
                for (var i = 0; i < recordElemColl.length; i++) {
                    var resource: ARTURIResource = Deserializer.createURI(recordElemColl[i].getElementsByTagName("resource")[0].children[0]);
                    var predicate: ARTURIResource = Deserializer.createURI(recordElemColl[i].getElementsByTagName("predicate")[0].children[0]);
                    var label: ARTResource = Deserializer.createRDFResource(recordElemColl[i].getElementsByTagName("object")[0].children[0]);
                    records.push({ resource: resource, predicate: predicate, label: label });
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
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithOverlappedSKOSLabel", params).map(
            stResp => {
                var recordElemColl: Element[] = stResp.getElementsByTagName("record");
                var records: any[] = [];
                for (var i = 0; i < recordElemColl.length; i++) {
                    var resource: ARTURIResource = Deserializer.createURI(recordElemColl[i]);
                    var label: ARTLiteral = Deserializer.createLiteral(recordElemColl[i]);
                    records.push({ resource: resource, label: label });
                }
                return records;
            }
        );
    }

    /**
     * Returns a list of records {resource: ARTURIResource, label: ARTLiteral}. A record like that means that the resource has 
	 * the same skosxl:prefLabel and skosxl:altLabel in the same language
     */
    listResourcesWithOverlappedSKOSXLLabel(): Observable<{ resource: ARTURIResource, prefLabel: ARTResource, altLabel: ARTResource }[]> {
        console.log("[IcvServices] listResourcesWithOverlappedSKOSXLLabel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithOverlappedSKOSXLLabel", params).map(
            stResp => {
                var recordElemColl: Element[] = stResp.getElementsByTagName("record");
                var records: any[] = [];
                for (var i = 0; i < recordElemColl.length; i++) {
                    var resource: ARTURIResource = Deserializer.createURI(recordElemColl[i]);
                    var prefLabel: ARTResource = Deserializer.createRDFResource(recordElemColl[i].getElementsByTagName("prefLabel")[0].children[0]);
                    var altLabel: ARTResource = Deserializer.createRDFResource(recordElemColl[i].getElementsByTagName("altLabel")[0].children[0]);
                    records.push({ resource: resource, prefLabel: prefLabel, altLabel: altLabel });
                }
                return records;
            }
        );
    }

    // /**
    //  * Returns a list of records concept-labelPred-label-lang. A record like that means that
    //  * that the concept ?concept has the skos label ?label in language ?lang for the predicates ?labelPred that
    //  * contains some extra whitespace (at the begin, at the end or multiple whitespace between two words)
    //  */
    // listConceptsWithExtraWhitespaceInSKOSLabel() {
    //     console.log("[IcvServices] listConceptsWithExtraWhitespaceInSKOSLabel");
    //     var params: any = {};
    //     return this.httpMgr.doGet(this.serviceName, "listConceptsWithExtraWhitespaceInSKOSLabel", params);
    // }

    // /**
    //  * Returns a list of records concept-labelPred-label-lang. A record like that means that
    //  * that the concept ?concept has the skosxl label ?label in language ?lang for the predicates ?labelPred that
    //  * contains some extra whitespace (at the begin, at the end or multiple whitespace between two words)
    //  */
    // listConceptsWithExtraWhitespaceInSKOSXLLabel() {
    //     console.log("[IcvServices] listConceptsWithExtraWhitespaceInSKOSXLLabel");
    //     var params: any = {};
    //     return this.httpMgr.doGet(this.serviceName, "listConceptsWithExtraWhitespaceInSKOSXLLabel", params);
    // }

    /**
     * Returns a list of dangling skosxl:Label, namely the skosxl:Label not linked with any concept
     */
    listDanglingXLabels(): Observable<ARTResource[]> {
        console.log("[IcvServices] listDanglingXLabels");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listDanglingXLabels", params, true).map(
            stResp => {
                return Deserializer.createResourceArray(stResp);
            }
        );
    }

    /**
     * Returns a list of resources with no lexicalization (rdfs:label, skos:prefLabel or skosxl:prefLabel) in one or more input languages
     * @param rolesArray 
     * @param languagesArray 
     */
    listResourcesNoLexicalization(rolesArray: RDFResourceRolesEnum[], languagesArray: string[]): Observable<ARTResource[]> {
        console.log("[IcvServices] listResourcesNoLexicalization");
        var params: any = {
            rolesArray: rolesArray,
            languagesArray: languagesArray
        };
        return this.httpMgr.doGet(this.serviceName, "listResourcesNoLexicalization", params, true).map(
            stResp => {
                return Deserializer.createResourceArray(stResp, ["missingLang"]);
            }
        );
    }

    /**
     * Returns a list of resources with alternative label but not preferred label in the same language
     * @param rolesArray 
     */
    listResourcesWithAltNoPrefLabel(rolesArray: RDFResourceRolesEnum[]): Observable<ARTResource[]> {
        console.log("[IcvServices] listResourcesWithAltNoPrefLabel");
        var params: any = {
            rolesArray: rolesArray
        };
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithAltNoPrefLabel", params, true).map(
            stResp => {
                return Deserializer.createURIArray(stResp, ["missingLang"]);
            }
        );
    }

    //==============================
    //======= GENERIC CHECKS =======
    //==============================

    /**
     * Returns resources which URI contains white spaces
     * @param limit max number of results to return
     */
    // listResourcesURIWithSpace() {
    //     console.log("[IcvServices] listResourcesURIWithSpace");
    //     var params: any = {};
    //     return this.httpMgr.doGet(this.serviceName, "listResourcesURIWithSpace", params);
    // }

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
            scheme: scheme
        };
        return this.httpMgr.doPost(this.serviceName, "setAllDanglingAsTopConcept", params, true);
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
            scheme: scheme,
            broader: broader
        };
        return this.httpMgr.doPost(this.serviceName, "setBroaderForAllDangling", params, true);
    }

    /**
     * Quick fix for dangling concepts. Removes all dangling concepts from the given scheme
     * @param scheme
     */
    removeAllDanglingFromScheme(scheme: ARTURIResource) {
        console.log("[IcvServices] removeAllDanglingFromScheme");
        var params: any = {
            scheme: scheme
        };
        return this.httpMgr.doPost(this.serviceName, "removeAllDanglingFromScheme", params, true);
    }

    /**
     * Quick fix for dangling concepts. Deletes all dangling concepts of the given scheme
     * @param scheme
     */
    deleteAllDanglingConcepts(scheme: ARTURIResource) {
        console.log("[IcvServices] deleteAllDanglingConcepts");
        var params: any = {
            scheme: scheme
        };
        return this.httpMgr.doPost(this.serviceName, "deleteAllDanglingConcepts", params, true);
    }

    /**
     * Quick fix for concepts in no scheme. Add all concepts without scheme to the given scheme
     * @param scheme
     */
    addAllConceptsToScheme(scheme: ARTURIResource) {
        console.log("[IcvServices] addAllConceptsToScheme");
        var params: any = {
            scheme: scheme
        };
        return this.httpMgr.doPost(this.serviceName, "addAllConceptsToScheme", params, true);
    }

    /**
     * Fix for topConcept with broader. Remove all the broader relation in the given scheme of the given concept.
     * @param concept
     * @param scheme
     */
    removeBroadersToConcept(concept: ARTURIResource, scheme: ARTURIResource) {
        console.log("[IcvServices] removeBroadersToConcept");
        var params: any = {
            concept: concept,
            scheme: scheme
        };
        return this.httpMgr.doPost(this.serviceName, "removeBroadersToConcept", params, true);
    }

    /**
     * Quick fix for topConcept with broader. Remove all the broader (or narrower) relation in the 
     * of top concepts with broader (in the same scheme).
     */
    removeBroadersToAllConcepts() {
        console.log("[IcvServices] removeBroadersToAllConcepts");
        var params: any = {};
        return this.httpMgr.doPost(this.serviceName, "removeBroadersToAllConcepts", params, true);
    }

    /**
     * Quick fix for topConcept with broader. Remove as topConceptOf all the topConcept with broader.
     */
    removeAllAsTopConceptsWithBroader() {
        console.log("[IcvServices] removeAllAsTopConceptsWithBroader");
        var params: any = {};
        return this.httpMgr.doPost(this.serviceName, "removeAllAsTopConceptsWithBroader", params, true);
    }

    /**
     * Quick fix for hierarchical redundancy. Remove narrower/broader redundant relations.
     */
    removeAllHierarchicalRedundancy() {
        console.log("[IcvServices] removeAllHierarchicalRedundancy");
        var params: any = {};
        return this.httpMgr.doPost(this.serviceName, "removeAllHierarchicalRedundancy", params, true);
    }

    /**
     * Quick fix for dangling xLabel. Deletes all the dangling labels.
     */
    deleteAllDanglingXLabel() {
        console.log("[IcvServices] deleteAllDanglingXLabel");
        var params: any = {};
        return this.httpMgr.doPost(this.serviceName, "deleteAllDanglingXLabel", params, true);
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
            concept: concept,
            xlabelPred: xlabelPred,
            xlabel: xlabel
        };
        return this.httpMgr.doPost(this.serviceName, "setDanglingXLabel", params, true);
    }

}