import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {VBEventHandler} from "../utils/VBEventHandler";
import {ARTURIResource} from "../utils/ARTResources";

@Injectable()
export class SkosServices {

    private serviceName = "skos";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }
    
    //Concept services 
    
    /**
     * Returns the topConcepts of the given scheme
     * @param scheme
     * @param lang
     * @return an array of top concepts
     */
    getTopConcepts(scheme: ARTURIResource, lang?: string) {
        console.log("[SkosServices] getTopConcepts");
        var params: any = {};
        if (scheme != null) {
            params.scheme = scheme.getURI();
        }
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "getTopConcepts", params, this.oldTypeService).map(
            stResp => {
                var topConcepts = Deserializer.createURIArray(stResp);
                for (var i = 0; i < topConcepts.length; i++) {
                    topConcepts[i].setAdditionalProperty("children", []);
                }
                return topConcepts;
            }
        );
    }

    /**
     * Returns the narrowers of the given concept
     * @param concept
     * @param scheme scheme where the narrower should belong
     * @param lang
     * @return an array of narrowers
     */
    getNarrowerConcepts(concept: ARTURIResource, scheme: ARTURIResource, lang?: string) {
        console.log("[SkosServices] getNarrowerConcepts");
        var params: any = {
            concept: concept.getURI(),
            treeView: true,
        };
        if (scheme != null) {
            params.scheme = scheme.getURI();
        }
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "getNarrowerConcepts", params, this.oldTypeService).map(
            stResp => {
                var narrower = Deserializer.createURIArray(stResp);
                for (var i = 0; i < narrower.length; i++) {
                    narrower[i].setAdditionalProperty("children", []);
                }
                return narrower;
            }
        );
    }

    /**
     * Creates a top concept in the given scheme. Emits a topConceptCreatedEvent with concept and scheme
     * @param concept local name of the new top concept
     * @param scheme scheme where new concept should belong
     * @param prefLabel preferred label of the concept
     * @param prefLabelLang language of the preferred label
     * @return an object containing concept and scheme
     */
    createTopConcept(concept: string, scheme: ARTURIResource, prefLabel: string, prefLabelLang: string) {
        console.log("[SkosServices] createConcept");
        var params: any = {
            concept: concept,
            scheme: scheme.getURI(),
        };
        if (prefLabel != undefined && prefLabelLang != undefined) {
            params.prefLabel = prefLabel;
            params.prefLabelLang = prefLabelLang;
        }
        return this.httpMgr.doGet(this.serviceName, "createConcept", params, this.oldTypeService).map(
            stResp => {
                var newConc = Deserializer.createURI(stResp);
                newConc.setAdditionalProperty("children", []);
                this.eventHandler.topConceptCreatedEvent.emit({concept: newConc, scheme: scheme});
                return {concept: newConc, scheme: scheme};
            });
    }
    
    /**
     * Set a concept as top concept of a scheme. Emits a topConceptAddedEvent with concept and scheme
     * @param concept concept to set as top concept
     * @param scheme where to add the top concept
     * @return object with concept and scheme
     */
    addTopConcept(concept: ARTURIResource, scheme: ARTURIResource) {
        console.log("[SkosServices] addTopConcept");
        var params: any = {
            concept: concept.getURI(),
            scheme: scheme.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "addTopConcept", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.topConceptCreatedEvent.emit({concept: concept, scheme: scheme});
                return {concept: concept, scheme: scheme};
            }
        );
    }
    
    /**
     * Removes the given concept as top concept of a scheme. Emit a conceptRemovedAsTopConceptEvent with concept and scheme.
     * @param concept the top concept
     * @param scheme
     */
    removeTopConcept(concept: ARTURIResource, scheme: ARTURIResource) {
        console.log("[SkosServices] removeTopConcept");
        var params: any = {
            concept: concept.getURI(),
            scheme: scheme.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "removeTopConcept", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.conceptRemovedAsTopConceptEvent.emit({concept: concept, scheme: scheme});
                return stResp;
            }   
        );
    }

    /**
     * Deletes the given concept. Emits a conceptDeletedEvent with the deleted concept
     * @param concept the concept to delete
     */
    deleteConcept(concept: ARTURIResource) {
        console.log("[SkosServices] deleteConcept");
        var params: any = {
            concept: concept.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "deleteConcept", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.conceptDeletedEvent.emit(concept);
                return stResp;
            }
        );
    }

    /**
     * Creates a narrower of the given concept. Emits a narrowerCreatedEvent with narrower (the created narrower) and broader
     * @param concept local name of the narrower
     * @return the new concept
     */
    createNarrower(concept: string, broader: ARTURIResource, scheme: ARTURIResource, prefLabel: string, prefLabelLang: string) {
        console.log("[SkosServices] createNarrower");
        var params: any = {
            concept: concept,
            broaderConcept: broader.getURI(),
            scheme: scheme.getURI(),
        };
        if (prefLabel != undefined && prefLabelLang != undefined) {
            params.prefLabel = prefLabel;
            params.prefLabelLang = prefLabelLang;
        }
        return this.httpMgr.doGet(this.serviceName, "createConcept", params, this.oldTypeService).map(
            stResp => {
                var newConc = Deserializer.createURI(stResp);
                newConc.setAdditionalProperty("children", []);
                this.eventHandler.narrowerCreatedEvent.emit({narrower: newConc, broader: broader});
                return newConc;
            });
    }
    
    /**
     * Adds the broader relation between two concepts. Emits a narrowerCreatedEvent with narrower and broader
     * @param concept concept to which add the broader
     * @param broaderConcept the broader concept
     */
    addBroaderConcept(concept: ARTURIResource, broaderConcept: ARTURIResource) {
        console.log("[SkosServices] addBroaderConcept");
        var params: any = {
            concept: concept.getURI(),
            broaderConcept: broaderConcept.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "addBroaderConcept", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.narrowerCreatedEvent.emit({narrower: concept, broader: broaderConcept});
                return stResp;
            }
        );
    }

    /**
     * Removes a broader from the given concept. Emits a broaderRemovedEvent with concept and broader (the removed broader)
     * @param concept 
     * @param broaderConcept broader to remove
     */
    removeBroaderConcept(concept: ARTURIResource, broaderConcept: ARTURIResource) {
        console.log("[SkosServices] removeBroaderConcept");
        var params: any = {
            concept: concept.getURI(),
            broaderConcept: broaderConcept.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "removeBroaderConcept", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.broaderRemovedEvent.emit({concept: concept, broader: broaderConcept});
                return stResp;
            }
        );
    }

    /**
     * Adds a concept to a scheme.
     * @param concept 
     * @param scheme
     */
    addConceptToScheme(concept: ARTURIResource, scheme: ARTURIResource, lang?: string) {
        console.log("[SkosServices] addConceptToScheme");
        var params: any = {
            concept: concept.getURI(),
            scheme: scheme.getURI(),
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "addConceptToScheme", params, this.oldTypeService);
    }

    /**
     * Removes a concept from the given scheme. Emits a conceptRemovedFromSchemeEvent with concept and scheme
     * @param concept
     * @param scheme
     * @return an object with concept and scheme
     */
    removeConceptFromScheme(concept: ARTURIResource, scheme: ARTURIResource) {
        console.log("[SkosServices] removeConceptFromScheme");
        var params: any = {
            concept: concept.getURI(),
            scheme: scheme.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "removeConceptFromScheme", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.conceptRemovedFromSchemeEvent.emit({concept: concept, scheme: scheme});
                return {concept: concept, scheme: scheme};
            }
        );
    }
    
    //Scheme services
    
    /**
     * Returns the list of available skos:ConceptScheme
     * @param lang
     * @return an array of schemes
     */
    getAllSchemesList(lang?: string) {
        console.log("[SkosServices] getAllSchemesList");
        var params: any = {};
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "getAllSchemesList", params, this.oldTypeService).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * Creates a new scheme
     * @param local name of the scheme
     * @param prefLabel
     * @param prefLabelLang
     * @return the new scheme
     */
    createScheme(scheme: string, prefLabel?: string, prefLabelLang?: string) {
        console.log("[SkosServices] createScheme");
        var params: any = {
            scheme: scheme,
        };
        if (prefLabel != undefined && prefLabelLang != undefined) {
            params.prefLabel = prefLabel;
            params.prefLabelLang = prefLabelLang;
        }
        return this.httpMgr.doGet(this.serviceName, "createScheme", params, this.oldTypeService).map(
            stResp => {
                var newScheme = Deserializer.createURI(stResp);
                return newScheme;
            });
    }

    /**
     * Deletes a scheme
     * @param scheme the scheme to delete
     * @param forceDeleteDanglingConcepts tells whether the dangling concept should be deleted
     */
    deleteScheme(scheme: ARTURIResource, forceDeleteDanglingConcepts?: boolean) {
        console.log("[SkosServices] deleteScheme");
        var params: any = {
            scheme: scheme.getURI(),
            setForceDeleteDanglingConcepts: forceDeleteDanglingConcepts != undefined,
        };
        if (forceDeleteDanglingConcepts != undefined) {
            params.forceDeleteDanglingConcepts = forceDeleteDanglingConcepts;
        }
        return this.httpMgr.doGet(this.serviceName, "deleteScheme", params, this.oldTypeService);
    }
    
    //Label services
    
    /**
     * Sets a preferred label to the given concept
     * @param concept
     * @param label lexical value of the label
     * @param lang
     */
    setPrefLabel(concept: ARTURIResource, label: string, lang: string) {
        console.log("[SkosServices] setPrefLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
            lang: lang,
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
        console.log("[SkosServices] removePrefLabel");
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
     */
    addAltLabel(concept: ARTURIResource, label: string, lang: string) {
        console.log("[SkosServices] addAltLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
            lang: lang,
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
        console.log("[SkosServices] removeAltLabel");
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
     */
    addHiddenLabel(concept: ARTURIResource, label: string, lang: string) {
        console.log("[SkosServices] addHiddenLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
            lang: lang,
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
        console.log("[SkosServices] removeHiddenLabel");
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