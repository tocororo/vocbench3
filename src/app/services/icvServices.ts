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

    /**
     * Returns a list of skos:Concept that are linked with other by the relation skos:related and other disjoint with this one
     */
    listConceptsRelatedDisjoint(): Observable<ARTURIResource[]> {
        console.log("[IcvServices] listConceptsRelatedDisjoint");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsRelatedDisjoint", params, true).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * Returns a list of skos:Concept that are linked with other by the relation skos:exactMatch and other disjoint with this one
     */
    listConceptsExactMatchDisjoint(): Observable<ARTURIResource[]> {
        console.log("[IcvServices] listConceptsExactMatchDisjoint");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsExactMatchDisjoint", params, true).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * Returns a list of concepts belonging to a hierarchical cycle 
     */
    listConceptsHierarchicalCycles(): Observable<ARTURIResource[][]> {
        console.log("[IcvServices] listConceptsHierarchicalCycles");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listConceptsHierarchicalCycles", params, true).map(
            stResp => {
                let cycles: ARTURIResource[][] = [];
                for (var i = 0; i < stResp.length; i++) {
                    cycles.push(Deserializer.createURIArray(stResp[i]));
                }
                return cycles;
            }
        );
    }

    //=============================
    //======== LABEL CHECKS ========
    //=============================

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

    /**
     * Returns a list of resources that have a label without languageTag
     */
    listResourcesWithNoLanguageTagForLabel(rolesArray: RDFResourceRolesEnum[]): Observable<ARTResource[]> {
        console.log("[IcvServices] listResourcesWithNoLanguageTagForLabel");
        var params: any = {
            rolesArray: rolesArray
        };
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithNoLanguageTagForLabel", params, true).map(
            stResp => {
                return Deserializer.createResourceArray(stResp, ["xlabel", "label"]);
            }
        );
    }

    /**
     * Returns a list of resources that have extra whitespaces in the label
     * @param rolesArray 
     */
    listResourcesWithExtraSpacesInLabel(rolesArray: RDFResourceRolesEnum[]): Observable<ARTResource[]> {
        console.log("[IcvServices] listResourcesWithExtraSpacesInLabel");
        var params: any = {
            rolesArray: rolesArray
        };
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithExtraSpacesInLabel", params, true).map(
            stResp => {
                return Deserializer.createResourceArray(stResp, ["xlabel", "label"]);
            }
        );
    }

    /**
     * Returns a list of resources that have a multiple preferred labels in the same language
     */
    listResourcesWithMorePrefLabelSameLang(rolesArray: RDFResourceRolesEnum[]): Observable<ARTResource[]> {
        console.log("[IcvServices] listResourcesWithMorePrefLabelSameLang");
        var params: any = {
            rolesArray: rolesArray
        };
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithMorePrefLabelSameLang", params, true).map(
            stResp => {
                return Deserializer.createResourceArray(stResp, ["duplicateLang"]);
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
     * Returns a list of resources that have the same preferred or alt label of another resource
     * @param rolesArray 
     */
    listResourcesWithOverlappedLabels(rolesArray: RDFResourceRolesEnum[]): Observable<ARTResource[]> {
        console.log("[IcvServices] listResourcesWithOverlappedLabels");
        var params: any = {
            rolesArray: rolesArray
        };
        return this.httpMgr.doGet(this.serviceName, "listResourcesWithOverlappedLabels", params, true).map(
            stResp => {
                return Deserializer.createResourceArray(stResp, ["xlabel", "label"]);
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
     * Returns a list of resources that have no definitions in the given language
     * @param rolesArray 
     * @param languagesArray 
     */
    listResourcesNoDef(rolesArray: RDFResourceRolesEnum[], languagesArray: string[]): Observable<ARTResource[]> {
        console.log("[IcvServices] listResourcesNoDef");
        var params: any = {
            rolesArray: rolesArray,
            languagesArray: languagesArray
        };
        return this.httpMgr.doGet(this.serviceName, "listResourcesNoDef", params, true).map(
            stResp => {
                return Deserializer.createURIArray(stResp, ["missingLang"]);
            }
        );
    }

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