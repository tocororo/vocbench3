import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {VBEventHandler} from "../utils/VBEventHandler";
import {ARTResource, ARTURIResource, ARTLiteral, ResAttribute, RDFTypesEnum, RDFResourceRolesEnum} from "../models/ARTResources";
import {SKOS} from "../models/Vocabulary";

@Injectable()
export class SkosServices {

    private serviceName_old = "skos";
    private oldTypeService_old = true;

    private serviceName = "SKOS";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }
    
    //====== Concept services ====== 
    
    /**
     * Returns the topConcepts of the given scheme
     * @param scheme
     * @return an array of top concepts
     */
    getTopConcepts(scheme: ARTURIResource) {
        console.log("[SkosServices] getTopConcepts");
        var params: any = {};
        if (scheme != null) {
            params.scheme = scheme;
        }
        return this.httpMgr.doGet(this.serviceName, "getTopConcepts", params, false, true).map(
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
     * @return an array of narrowers
     */
    getNarrowerConcepts(concept: ARTURIResource, scheme: ARTURIResource) {
        console.log("[SkosServices] getNarrowerConcepts");
        var params: any = {
            concept: concept,
            treeView: true,
        };
        if (scheme != null) {
            params.scheme = scheme;
        }
        return this.httpMgr.doGet(this.serviceName, "getNarrowerConcepts", params, false, true).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "createConcept", params, this.oldTypeService_old).map(
            stResp => {
                var newConc = Deserializer.createURI(stResp);
                newConc.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.topConceptCreatedEvent.emit({concept: newConc, scheme: scheme});
                return {concept: newConc, scheme: scheme};
            });
    }

    /**
     * Creates a top concept in the given scheme. Emits a topConceptCreatedEvent with concept and scheme.
     * NB: although the service server-side has both label and newConcept optional, here only newConcept is optional,
     * so the user is forced to write at least the label.
     * @param label preferred label of the concept (comprehensive of the lang)
     * @param conceptScheme scheme where new concept should belong
     * @param newConcept URI concept
     * @param conceptCls class of the concept that is creating (a subclass of skos:Concept, if not provided the default is skos:Concept)
     * @param customFormId id of the custom form that set additional info to the concept
     * @param userPromptMap json map object of key - value of the custom form
     * @return 
     */
    createTopConcept_NEW(label: ARTLiteral, conceptScheme: ARTURIResource, newConcept?: ARTURIResource, conceptCls?: ARTURIResource, 
        customFormId?: string, userPromptMap?: any) {
        console.log("[SkosServices] createConcept");
        var params: any = {
            label: label,
            conceptScheme: conceptScheme,
        };
        if (newConcept != null) {
            params.newConcept = newConcept
        }
        if (conceptCls != null) {
            params.conceptCls = conceptCls;
        }
        if (customFormId != null && userPromptMap != null) {
            params.customFormId = customFormId;
            params.userPromptMap = JSON.stringify(userPromptMap);
        }
        return this.httpMgr.doPost(this.serviceName, "createConcept", params, this.oldTypeService, true).map(
            stResp => {
                var newConc = Deserializer.createURI(stResp);
                newConc.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.topConceptCreatedEvent.emit({concept: newConc, scheme: conceptScheme});
                return {concept: newConc, scheme: conceptScheme};
            }
        );
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
        return this.httpMgr.doGet(this.serviceName_old, "addTopConcept", params, this.oldTypeService_old).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "removeTopConcept", params, this.oldTypeService_old).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "deleteConcept", params, this.oldTypeService_old).map(
            stResp => {
                this.eventHandler.conceptDeletedEvent.emit(concept);
                return stResp;
            }
        );
    }

    /**
     * Creates a narrower of the given concept. Emits a narrowerCreatedEvent with narrower (the created narrower) and broader
     * @param label preferred label of the concept (comprehensive of the lang)
     * @param broaderConcept broader of the new created concept
     * @param conceptScheme scheme where new concept should belong
     * @param newConcept URI concept
     * @param conceptCls class of the concept that is creating (a subclass of skos:Concept, if not provided the default is skos:Concept)
     * @param customFormId id of the custom form that set additional info to the concept
     * @param userPromptMap json map object of key - value of the custom form
     * @return the new concept
     */
    createNarrower(label: ARTLiteral, broaderConcept: ARTURIResource, conceptScheme: ARTURIResource, newConcept?: ARTURIResource,
            conceptCls?: ARTURIResource, customFormId?: string, userPromptMap?: any) {
        console.log("[SkosServices] createConcept");
        var params: any = {
            label: label,
            conceptScheme: conceptScheme,
            broaderConcept: broaderConcept
        };
        if (newConcept != null) {
            params.newConcept = newConcept
        }
        if (conceptCls != null) {
            params.conceptCls = conceptCls;
        }
        if (customFormId != null && userPromptMap != null) {
            params.customFormId = customFormId;
            params.userPromptMap = JSON.stringify(userPromptMap);
        }
        return this.httpMgr.doPost(this.serviceName, "createConcept", params, this.oldTypeService, true).map(
            stResp => {
                var newConc = Deserializer.createURI(stResp);
                newConc.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.narrowerCreatedEvent.emit({narrower: newConc, broader: broaderConcept});
                return newConc;
            }
        );
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
        return this.httpMgr.doGet(this.serviceName_old, "addBroaderConcept", params, this.oldTypeService_old).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "removeBroaderConcept", params, this.oldTypeService_old).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "addConceptToScheme", params, this.oldTypeService_old);
        /**
         * here I should emit an event conceptAddedToSchemEvent with {concept, scheme, broader?}
         * where borader is optional and tells if the concept should appear under another concept or it's a topConcept
         */
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
        return this.httpMgr.doGet(this.serviceName_old, "removeConceptFromScheme", params, this.oldTypeService_old).map(
            stResp => {
                this.eventHandler.conceptRemovedFromSchemeEvent.emit({concept: concept, scheme: scheme});
                return {concept: concept, scheme: scheme};
            }
        );
    }
    
    //====== Scheme services ======

    /**
     * Returns the list of available skos:ConceptScheme (New service)
     * @return an array of schemes
     */
    getAllSchemes() {
        console.log("[SkosServices] getAllSchemes");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getAllSchemes", params, false, true).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * Creates a new scheme
     * @param label the lexical form of the pref label
     * @param newScheme the (optional) uri of the scheme
     * @param schemeCls class of the scheme that is creating (a subclass of skos:ConceptScheme, if not provided the default is skos:ConceptScheme)
     * @param customFormId id of the custom form that set additional info to the concept
     * @param userPromptMap json map object of key - value of the custom form
     * @return the new scheme
     */
    createConceptScheme(label: ARTLiteral, newScheme?: ARTURIResource, schemeCls?: ARTURIResource, 
            customFormId?: string, userPromptMap?: any) {
        console.log("[SkosServices] createConceptScheme");
        var params: any = {
            label: label
        };
        if (newScheme != undefined) {
            params.newScheme = newScheme;
        };
        if (schemeCls != undefined) {
            params.schemeCls = schemeCls;
        };
        if (customFormId != null && userPromptMap != null) {
            params.customFormId = customFormId;
            params.userPromptMap = JSON.stringify(userPromptMap);
        }
        return this.httpMgr.doPost(this.serviceName, "createConceptScheme", params, this.oldTypeService, true).map(
            stResp => {
                var newScheme = Deserializer.createURI(stResp);
                return newScheme;
            }
        );
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
        return this.httpMgr.doGet(this.serviceName_old, "deleteScheme", params, this.oldTypeService_old, false, true);
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
        return this.httpMgr.doGet(this.serviceName_old, "setPrefLabel", params, this.oldTypeService_old).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "removePrefLabel", params, this.oldTypeService_old).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "getAltLabels", params, this.oldTypeService_old).map(
            stResp => {
                return Deserializer.createRDFNodeArray(stResp);
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
        return this.httpMgr.doGet(this.serviceName_old, "addAltLabel", params, this.oldTypeService_old);
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
        return this.httpMgr.doGet(this.serviceName_old, "removeAltLabel", params, this.oldTypeService_old);
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
        return this.httpMgr.doGet(this.serviceName_old, "addHiddenLabel", params, this.oldTypeService_old);
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
        return this.httpMgr.doGet(this.serviceName_old, "removeHiddenLabel", params, this.oldTypeService_old);
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
        return this.httpMgr.doGet(this.serviceName_old, "getShow", params, this.oldTypeService_old).map(
            stResp => {
                return stResp.getElementsByTagName("show")[0].getAttribute("value");
            }
        );
    }

    //====== Collection services ======

    /**
     * Gets the root collections
     */
    getRootCollections() {
        console.log("[SkosServices] getRootCollections");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getRootCollections", params, false, true).map(
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
     */
    getNestedCollections(container: ARTResource) {
        console.log("[SkosServices] getNestedCollections");
        var params: any = {
            container: container
        };
        return this.httpMgr.doGet(this.serviceName, "getNestedCollections", params, false, true).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "createCollection", params, this.oldTypeService_old).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "createCollection", params, this.oldTypeService_old).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "addToCollection", params, true).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "removeFromCollection", params, this.oldTypeService_old).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "deleteCollection", params, this.oldTypeService_old).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "createOrderedCollection", params, this.oldTypeService_old).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "createOrderedCollection", params, this.oldTypeService_old).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "addFirstToOrderedCollection", params, this.oldTypeService_old).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "addLastToOrderedCollection", params, this.oldTypeService_old).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "addInPositionToOrderedCollection", params, this.oldTypeService_old).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "removeFromOrderedCollection", params, this.oldTypeService_old).map(
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
        return this.httpMgr.doGet(this.serviceName_old, "deleteOrderedCollection", params, this.oldTypeService_old).map(
            stResp => {
                this.eventHandler.collectionDeletedEvent.emit(collection);
                return stResp;
            }
        );
    }

}