import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {VBEventHandler} from "../utils/VBEventHandler";
import {ARTURIResource, ResAttribute} from "../utils/ARTResources";

@Injectable()
export class SkosServices {

    private serviceName = "skos";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }
    
    //====== Concept services ====== 
    
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
                    topConcepts[i].setAdditionalProperty(ResAttribute.CHILDREN, []);
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
                    narrower[i].setAdditionalProperty(ResAttribute.CHILDREN, []);
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
     * @param lang language in which the new created concept should be desplayed (determines the "show" of the concept
     * in the response)
     * @return an object containing concept and scheme
     */
    createTopConcept(concept: string, scheme: ARTURIResource, prefLabel?: string, prefLabelLang?: string, lang?: string) {
        console.log("[SkosServices] createConcept");
        var params: any = {
            concept: concept,
            scheme: scheme.getURI(),
        };
        if (prefLabel != undefined && prefLabelLang != undefined) {
            params.prefLabel = prefLabel;
            params.prefLabelLang = prefLabelLang;
        }
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "createConcept", params, this.oldTypeService).map(
            stResp => {
                var newConc = Deserializer.createURI(stResp);
                newConc.setAdditionalProperty(ResAttribute.CHILDREN, []);
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
     * @param scheme scheme where new concept should belong
     * @param prefLabel preferred label of the concept
     * @param prefLabelLang language of the preferred label
     * @param lang language in which the new created concept should be desplayed (determines the "show" of the concept
     * in the response)
     * @return the new concept
     */
    createNarrower(concept: string, broader: ARTURIResource, scheme: ARTURIResource, prefLabel?: string, prefLabelLang?: string, lang?: string) {
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
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "createConcept", params, this.oldTypeService).map(
            stResp => {
                var newConc = Deserializer.createURI(stResp);
                newConc.setAdditionalProperty(ResAttribute.CHILDREN, []);
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
    
    //====== Scheme services ======
    
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
     * @param lang language in which the new created concept should be desplayed (determines the "show" of the concept
     * in the response)
     * @return the new scheme
     */
    createScheme(scheme: string, prefLabel?: string, prefLabelLang?: string, lang?: string) {
        console.log("[SkosServices] createScheme");
        var params: any = {
            scheme: scheme,
        };
        if (prefLabel != undefined && prefLabelLang != undefined) {
            params.prefLabel = prefLabel;
            params.prefLabelLang = prefLabelLang;
        }
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "createScheme", params, this.oldTypeService).map(
            stResp => {
                var newScheme = Deserializer.createURI(stResp);
                return newScheme;
            });
    }

    /**
     * Deletes a scheme. Throws an Error if forceDeleteDanglingConcepts is not passed and the scheme is not empty
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
        //last param skips the "Error" alert in case the scheme has concept, so I can handle it in the component 
        return this.httpMgr.doGet(this.serviceName, "deleteScheme", params, this.oldTypeService, false, true);
    }
    
    //====== Label services ======
    
    /**
     * Sets a preferred label to the given concept (or scheme). Emits a skosPrefLabelSetEvent with
     * resource, label and lang
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
        return this.httpMgr.doGet(this.serviceName, "setPrefLabel", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.skosPrefLabelSetEvent.emit({resource: concept, label: label, lang: lang});
                return stResp;
            }
        );
    }

    /**
     * Removes a preferred label from the given concept (or scheme). Emits a skosPrefLabelRemovedEvent with
     * resource, label and lang
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
        return this.httpMgr.doGet(this.serviceName, "removePrefLabel", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.skosPrefLabelRemovedEvent.emit({resource: concept, label: label, lang: lang});
                return stResp;
            }
        );
	}

    /**
     * Adds an alternative label to the given concept (or scheme)
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
     * Removes an alternative label from the given concept (or scheme)
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
     * Adds an hidden label to the given concept (or scheme)
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
     * Removes an hidden label from the given concept (or scheme)
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
    
    /**
     * Returns the show of a resource (concept or scheme) according to the given language (if provide)
     * @param resource concept or conceptScheme
     * @param lang if provided returns the show for that language, otherwise returns the localName of the resource 
     */
    getShow(resource: ARTURIResource, lang?: string) {
        console.log("[SkosServices] getShow");
        var params: any = {
            resourceName: resource.getURI()
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "getShow", params, this.oldTypeService).map(
            stResp => {
                return stResp.getElementsByTagName("show")[0].getAttribute("value");
            }
        );
    }

    //====== Collection services ======

    /**
     * Gets the root collections
     * @param lang language in which the show attribute should be rendered
     */
    getRootCollections(lang?: string) {
        console.log("[SkosServices] getRootCollections");
        var params: any = {};
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "getRootCollections", params, this.oldTypeService).map(
            stResp => {
                var rootColl = Deserializer.createURIArray(stResp);
                for (var i = 0; i < rootColl.length; i++) {
                    rootColl[i].setAdditionalProperty(ResAttribute.CHILDREN, []);
                }
                return rootColl;
            }
        );
    }

    /**
     * Get the nested collections of a container collection
     * @param container the URI of the container collection
     * @param lang language in which the show attribute should be rendered
     */
    getNestedCollections(container: ARTURIResource, lang?: string) {
        console.log("[SkosServices] getNestedCollections");
        var params: any = {
            container: container.getURI()
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "getNestedCollections", params, this.oldTypeService).map(
            stResp => {
                var nestedColl = Deserializer.createURIArray(stResp);
                for (var i = 0; i < nestedColl.length; i++) {
                    nestedColl[i].setAdditionalProperty(ResAttribute.CHILDREN, []);
                }
                return nestedColl;
            }
        );
    }

    /**
     * Creates a root collection
     * @param collection the name of the collection. If not provided its URI is generated randomically
     * @param prefLabel the preferred label of the collection
     * @param prefLabelLang the language of the preferred label
     * @param lang language in which the show attribute should be rendered
     */
    createRootCollection(collection?: string, prefLabel?: string, prefLabelLang?: string, lang?: string) {
        console.log("[SkosServices] createCollection");
        var params: any = {};
        if (collection != undefined) {
            params.collection = collection;
        }
        if (prefLabel != undefined) {
            params.prefLabel = prefLabel;
        }
        if (prefLabelLang != undefined) {
            params.prefLabelLang = prefLabelLang;
        }
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "createCollection", params, this.oldTypeService).map(
            stResp => {
                var newColl = Deserializer.createURI(stResp);
                this.eventHandler.rootCollectionCreatedEvent.emit(newColl);
                return newColl;
            }
        );
    }

    /**
     * Creates a nested collection for the given container
     * @param collection the name of the collection. If not provided its URI is generated randomically
     * @param container the container collection
     * @param prefLabel the preferred label of the collection
     * @param prefLabelLang the language of the preferred label
     * @param lang language in which the show attribute should be rendered
     */
    createNestedCollection(container: ARTURIResource, collection?: string,
        prefLabel?: string, prefLabelLang?: string, lang?: string) {

        console.log("[SkosServices] createCollection");
        var params: any = {
            container: container.getURI()
        };
        if (collection != undefined) {
            params.collection = collection;
        }
        if (prefLabel != undefined) {
            params.prefLabel = prefLabel;
        }
        if (prefLabelLang != undefined) {
            params.prefLabelLang = prefLabelLang;
        }
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "createCollection", params, this.oldTypeService).map(
            stResp => {
                var newColl = Deserializer.createURI(stResp);
                this.eventHandler.nestedCollectionCreatedEvent.emit({nested: newColl, container: container});
                return newColl;
            }
        );
    }

}