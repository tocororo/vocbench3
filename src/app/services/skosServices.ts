import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {VBEventHandler} from "../utils/VBEventHandler";
import {ARTResource, ARTURIResource, ResAttribute, RDFTypesEnum, RDFResourceRolesEnum} from "../utils/ARTResources";
import {SKOS} from "../utils/Vocabulary";

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
     * @param prefLabel preferred label of the concept
     * @param prefLabelLang language of the preferred label
     * @param scheme scheme where new concept should belong
     * @param concept local name of the new top concept
     * @param lang language in which the new created concept should be desplayed (determines the "show" of the concept
     * in the response)
     * @return an object containing concept and scheme
     */
    createTopConcept(prefLabel: string, prefLabelLang: string, scheme: ARTURIResource, concept?: string, lang?: string) {
        console.log("[SkosServices] createConcept");
        var params: any = {
            prefLabel: prefLabel,
            prefLabelLang,
            scheme: scheme.getURI(),
        };
        if (concept != undefined) {
            params.concept = concept;
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
     * @param prefLabel preferred label of the concept
     * @param prefLabelLang language of the preferred label
     * @param broader concept to which add the narrower
     * @param scheme scheme where new concept should belong
     * @param concept local name of the narrower
     * @param lang language in which the new created concept should be desplayed (determines the "show" of the concept
     * in the response)
     * @return the new concept
     */
    createNarrower(prefLabel: string, prefLabelLang: string, broader: ARTURIResource, scheme: ARTURIResource, concept?: string, lang?: string) {
        console.log("[SkosServices] createNarrower");
        var params: any = {
            prefLabel: prefLabel,
            prefLabelLang: prefLabelLang,
            broaderConcept: broader.getURI(),
            scheme: scheme.getURI(),
        };
        if (concept != undefined) {
            params.concept = concept;
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
     * Adds the broader relation between two concepts. Emits a narrowerAddedEvent with narrower and broader
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
                var narrower: ARTURIResource = Deserializer.createURI(stResp);
                narrower.setAdditionalProperty(ResAttribute.CHILDREN, []);
                narrower.setAdditionalProperty(ResAttribute.MORE, concept.getAdditionalProperty(ResAttribute.MORE));
                this.eventHandler.broaderAddedEvent.emit({narrower: narrower, broader: broaderConcept});
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
     * @param prefLabel
     * @param prefLabelLang
     * @param local name of the scheme. Optional, if not provider a localName is generated randomly
     * @param lang language in which the new created concept should be desplayed (determines the "show" of the concept
     * in the response)
     * @return the new scheme
     */
    createScheme(prefLabel: string, prefLabelLang: string, scheme?: string, lang?: string) {
        console.log("[SkosServices] createScheme");
        var params: any = {
            prefLabel: prefLabel,
            prefLabelLang: prefLabelLang
        };
        if (scheme != undefined) {
            params.scheme = scheme;
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
        //(e.g. ask to the user to delete or retain dangling concepts) 
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
     * Returns the alternative skos labels for the given concept in the given language
     * @param concept
     * @param lang
     */
    getAltLabels(concept: ARTURIResource, lang: string) {
        console.log("[SkosServices] getAltLabels");
        var params: any = {
            concept: concept.getURI(),
            lang: lang,
        };
        return this.httpMgr.doGet(this.serviceName, "getAltLabels", params, this.oldTypeService).map(
            stResp => {
                return Deserializer.createRDFArray(stResp);
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
    getNestedCollections(container: ARTResource, lang?: string) {
        console.log("[SkosServices] getNestedCollections");
        var params: any = {
            container: container.getNominalValue()
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
     * @param prefLabel the preferred label of the collection
     * @param prefLabelLang the language of the preferred label
     * @param collection the name of the collection. If not provided its URI is generated randomically
     * @param lang language in which the show attribute should be rendered
     * @param mode can be 'bnode' or 'uri'. Default is 'bnode'
     */
    createRootCollection(prefLabel: string, prefLabelLang: string, collection?: string, lang?: string, mode?: string) {
        console.log("[SkosServices] createCollection");
        var params: any = {
            prefLabel: prefLabel,
            prefLabelLang: prefLabelLang
        };
        if (collection != undefined) {
            params.collection = collection;
        }
        if (lang != undefined) {
            params.lang = lang;
        }
        if (mode != undefined) {
            params.mode = mode;
        }
        return this.httpMgr.doGet(this.serviceName, "createCollection", params, this.oldTypeService).map(
            stResp => {
                var newColl = Deserializer.createURI(stResp);
                newColl.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.rootCollectionCreatedEvent.emit(newColl);
                return newColl;
            }
        );
    }

    /**
     * Creates a nested collection for the given container
     * @param container the container collection
     * @param prefLabel the preferred label of the collection
     * @param prefLabelLang the language of the preferred label
     * @param collection the name of the collection. If not provided its URI is generated randomically
     * @param lang language in which the show attribute should be rendered
     * @param mode can be 'bnode' or 'uri'. Default is 'bnode'
     */
    createNestedCollection(container: ARTResource, prefLabel: string, prefLabelLang: string, 
        collection?: string, lang?: string, mode?: string) {

        console.log("[SkosServices] createCollection");
        var params: any = {
            container: container.getNominalValue(),
            prefLabel: prefLabel,
            prefLabelLang: prefLabelLang
        };
        if (collection != undefined) {
            params.collection = collection;
        }
        if (lang != undefined) {
            params.lang = lang;
        }
        if (mode != undefined) {
            params.mode = mode;
        }
        return this.httpMgr.doGet(this.serviceName, "createCollection", params, this.oldTypeService).map(
            stResp => {
                var newColl = Deserializer.createURI(stResp);
                newColl.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.nestedCollectionCreatedEvent.emit({nested: newColl, container: container});
                return newColl;
            }
        );
    }

    /**
     * Adds an element to a collection. If the element is a collection, emits a nestedCollectionAddedEvent
     * @param collection Collection to which add the element
     * @param element Collection or Concept to add
     * @param lang language used to render the added element in the response
     */
    addToCollection(collection: ARTResource, element: ARTResource, lang?: string) {
        console.log("[SkosServices] addToCollection");
        var params: any = {
            collection: collection.getNominalValue(),
            element: element.getNominalValue()
        };
        if (lang != null) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "addToCollection", params, true).map(
            stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    var addedNestedElem = stResp.getElementsByTagName("addedNested")[0];
                    var nested: ARTResource = Deserializer.createRDFResource(addedNestedElem.children[0]);
                    this.eventHandler.nestedCollectionAddedEvent.emit({nested: nested, container: collection});
                } 
                return stResp;
            }
        );
    }

    /**
     * Removes an element from a collection. If the element is a collection, emits a nestedCollectionRemovedEvent.
     * Moreover if the removed nested collection is no member of another one, it turns into a root, 
     * so emits also a rootCollectionCreatedEvent.
     * @param collection Collection to which remove the element
     * @param element Collection or Concept to remove
     * @param lang language used to render the removed element in the response
     */
    removeFromCollection(collection: ARTResource, element: ARTResource, lang?: string) {
        console.log("[SkosServices] removeFromCollection");
        var params: any = {
            collection: collection.getNominalValue(),
            element: element.getNominalValue(),
        };
        if (lang != null) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "removeFromCollection", params, this.oldTypeService).map(
            stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    this.eventHandler.nestedCollectionRemovedEvent.emit({nested: element, container: collection});
                    //if the removed nested collection turns into a root, emits a rootCollectionCreatedEvent
                    var addedRootElemColl = stResp.getElementsByTagName("addedRoot");
                    if (addedRootElemColl.length > 0) {
                        var newRoot: ARTResource = Deserializer.createRDFResource(addedRootElemColl[0].children[0]);
                        this.eventHandler.rootCollectionCreatedEvent.emit(newRoot);
                    }
                } 
                return stResp;
            }
        );
    }

    /**
     * Deletes a collection. Emits a collectionDeletedEvent
     * @param collection Collection to delete
     */
    deleteCollection(collection: ARTURIResource) {
        console.log("[SkosServices] deleteCollection");
        var params: any = {
            collection: collection.getNominalValue(),
        };
        return this.httpMgr.doGet(this.serviceName, "deleteCollection", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.collectionDeletedEvent.emit(collection);
                return stResp;
            }
        );
    }

    /**
     * Creates a root ordered collection
     * @param prefLabel the preferred label of the collection
     * @param prefLabelLang the language of the preferred label
     * @param collection the name of the collection. If not provided its URI is generated randomically
     * @param lang language in which the show attribute should be rendered
     * @param mode can be 'bnode' or 'uri'. Default is 'bnode'
     */
    createRootOrderedCollection(prefLabel: string, prefLabelLang: string, collection?: string, lang?: string, mode?: string) {
        console.log("[SkosServices] createRootOrderedCollection");
        var params: any = {
            prefLabel: prefLabel,
            prefLabelLang: prefLabelLang
        };
        if (collection != undefined) {
            params.collection = collection;
        }
        if (lang != undefined) {
            params.lang = lang;
        }
        if (mode != undefined) {
            params.mode = mode;
        }
        return this.httpMgr.doGet(this.serviceName, "createOrderedCollection", params, this.oldTypeService).map(
            stResp => {
                var newColl = Deserializer.createURI(stResp);
                newColl.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.rootCollectionCreatedEvent.emit(newColl);
                return newColl;
            }
        );
    }

    /**
     * Creates a nested ordered collection for the given container
     * @param container the container collection
     * @param prefLabel the preferred label of the collection
     * @param prefLabelLang the language of the preferred label
     * @param collection the name of the collection. If not provided its URI is generated randomically
     * @param lang language in which the show attribute should be rendered
     * @param mode can be 'bnode' or 'uri'. Default is 'bnode'
     */
    createNestedOrderedCollection(container: ARTResource, prefLabel: string, prefLabelLang: string, 
        collection?: string, lang?: string, mode?: string) {

        console.log("[SkosServices] createNestedOrderedCollection");
        var params: any = {
            container: container.getNominalValue(),
            prefLabel: prefLabel,
            prefLabelLang: prefLabelLang
        };
        if (collection != undefined) {
            params.collection = collection;
        }
        if (lang != undefined) {
            params.lang = lang;
        }
        if (mode != undefined) {
            params.mode = mode;
        }
        return this.httpMgr.doGet(this.serviceName, "createOrderedCollection", params, this.oldTypeService).map(
            stResp => {
                var newColl = Deserializer.createURI(stResp);
                newColl.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.nestedCollectionCreatedEvent.emit({nested: newColl, container: container});
                return newColl;
            }
        );
    }

    /**
     * Adds an element to an ordered collection at its beginning.
     * If the element is a collection, emits a nestedCollectionAddedFirstEvent
     * @param collection Collection to which add the element
     * @param element Collection or Concept to add
     * @param lang language used to render the added element in the response
     */
    addFirstToOrderedCollection(collection: ARTResource, element: ARTResource, lang?: string) {
        console.log("[SkosServices] addFirstToOrderedCollection");
        var params: any = {
            collection: collection.getNominalValue(),
            element: element.getNominalValue()
        };
        if (lang != null) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "addFirstToOrderedCollection", params, this.oldTypeService).map(
            stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    var addedNestedElem = stResp.getElementsByTagName("addedNested")[0];
                    var nested: ARTResource = Deserializer.createRDFResource(addedNestedElem.children[0]);
                    this.eventHandler.nestedCollectionAddedFirstEvent.emit({nested: nested, container: collection});
                } 
                return stResp;
            }
        );
    }
    
    /**
     * Adds an element to an ordered collection at its end.
     * If the element is a collection, emits a nestedCollectionAddedLastEvent
     * @param collection Collection to which add the element
     * @param element Collection or Concept to add
     * @param lang language used to render the added element in the response
     */
    addLastToOrderedCollection(collection: ARTResource, element: ARTResource, lang?: string) {
        console.log("[SkosServices] addLastToOrderedCollection");
        var params: any = {
            collection: collection.getNominalValue(),
            element: element.getNominalValue()
        };
        if (lang != null) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "addLastToOrderedCollection", params, this.oldTypeService).map(
            stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    var addedNestedElem = stResp.getElementsByTagName("addedNested")[0];
                    var nested: ARTResource = Deserializer.createRDFResource(addedNestedElem.children[0]);
                    this.eventHandler.nestedCollectionAddedLastEvent.emit({nested: nested, container: collection});
                } 
                return stResp;
            }
        );
    }

    /**
     * Adds an element to an ordered collection at a given position (index starting from 1).
     * If the element is a collection, emits a nestedCollectionAddedInPositionEvent
     * @param collection Collection to which add the element
     * @param element Collection or Concept to add
     * @param index position where to add the element
     * @param lang language used to render the added element in the response
     */
    addInPositionToOrderedCollection(collection: ARTResource, element: ARTResource, index: number, lang?: string) {
        console.log("[SkosServices] addInPositionToOrderedCollection");
        var params: any = {
            collection: collection.getNominalValue(),
            element: element.getNominalValue(),
            index: index
        };
        if (lang != null) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "addInPositionToOrderedCollection", params, this.oldTypeService).map(
            stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    var addedNestedElem = stResp.getElementsByTagName("addedNested")[0];
                    var nested: ARTResource = Deserializer.createRDFResource(addedNestedElem.children[0]);
                    this.eventHandler.nestedCollectionAddedInPositionEvent.emit({nested: nested, container: collection, position: index});
                } 
                return stResp;
            }
        );
    }
    
    /**
     * Removes an element from an ordered collection. If the element is a collection, emits a nestedCollectionRemovedEvent.
     * Moreover if the removed nested collection is no member of another one, it turns into a root, 
     * so emits also a rootCollectionCreatedEvent.
     * @param collection Collection to which remove the element
     * @param element Collection or Concept to remove
     * @param lang language used to render the removed element in the response
     */
    removeFromOrderedCollection(collection: ARTResource, element: ARTResource, lang?: string) {
        console.log("[SkosServices] removeFromOrderedCollection");
        var params: any = {
            collection: collection.getNominalValue(),
            element: element.getNominalValue()
        };
        if (lang != null) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "removeFromOrderedCollection", params, this.oldTypeService).map(
            stResp => {
                //TODO remove true in following check, now it's necessary only because in resourceView, currently, 
                //collection members have individual as role 
                if (true || element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    this.eventHandler.nestedCollectionRemovedEvent.emit({nested: element, container: collection});
                    //if the removed nested collection turns into a root, emits a rootCollectionCreatedEvent
                    var addedRootElemColl = stResp.getElementsByTagName("addedRoot");
                    if (addedRootElemColl.length > 0) {
                        var newRoot: ARTResource = Deserializer.createRDFResource(addedRootElemColl[0].children[0]);
                        this.eventHandler.rootCollectionCreatedEvent.emit(newRoot);
                    }
                } 
                return stResp;
            }
        );
    }
    
    /**
     * Deletes an ordered collection. Emits a collectionDeletedEvent
     * @param collection Collection to delete
     */
    deleteOrderedCollection(collection: ARTURIResource) {
        console.log("[SkosServices] deleteOrderedCollection");
        var params: any = {
            collection: collection.getNominalValue(),
        };
        return this.httpMgr.doGet(this.serviceName, "deleteOrderedCollection", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.collectionDeletedEvent.emit(collection);
                return stResp;
            }
        );
    }

}