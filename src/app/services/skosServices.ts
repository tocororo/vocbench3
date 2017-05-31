import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { VBEventHandler } from "../utils/VBEventHandler";
import { ARTResource, ARTURIResource, ARTLiteral, ResAttribute, RDFTypesEnum, RDFResourceRolesEnum } from "../models/ARTResources";
import { SKOS } from "../models/Vocabulary";

@Injectable()
export class SkosServices {

    private serviceName = "SKOS";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    //====== Concept services ====== 

    /**
     * Returns the topConcepts of the given scheme
     * @param schemes
     * @return an array of top concepts
     */
    getTopConcepts(schemes: ARTURIResource[]) {
        console.log("[SkosServices] getTopConcepts");
        var params: any = {};
        if (schemes != null) {
            params.schemes = schemes;
        }
        return this.httpMgr.doGet(this.serviceName, "getTopConcepts", params, this.oldTypeService, true).map(
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
     * @param schemes schemes where the narrower should belong
     * @return an array of narrowers
     */
    getNarrowerConcepts(concept: ARTURIResource, schemes: ARTURIResource[]) {
        console.log("[SkosServices] getNarrowerConcepts");
        var params: any = {
            concept: concept,
            treeView: true,
        };
        if (schemes != null) {
            params.schemes = schemes;
        }
        return this.httpMgr.doGet(this.serviceName, "getNarrowerConcepts", params, this.oldTypeService, true).map(
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
     * Creates a top concept in the given scheme. Emits a topConceptCreatedEvent with concept and scheme.
     * NB: although the service server-side has both label and newConcept optional, here only newConcept is optional,
     * so the user is forced to write at least the label.
     * @param label preferred label of the concept (comprehensive of the lang)
     * @param conceptSchemes scheme where new concept should belong
     * @param newConcept URI concept
     * @param conceptCls class of the concept that is creating (a subclass of skos:Concept, if not provided the default is skos:Concept)
     * @param customFormId id of the custom form that set additional info to the concept
     * @param userPromptMap json map object of key - value of the custom form
     * @return 
     */
    createTopConcept(label: ARTLiteral, conceptSchemes: ARTURIResource[], newConcept?: ARTURIResource, conceptCls?: ARTURIResource,
        customFormId?: string, userPromptMap?: any) {
        console.log("[SkosServices] createConcept");
        var params: any = {
            label: label,
            conceptSchemes: conceptSchemes,
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
                this.eventHandler.topConceptCreatedEvent.emit({ concept: newConc, schemes: conceptSchemes });
                return { concept: newConc, scheme: conceptSchemes };
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
            concept: concept,
            scheme: scheme,
        };
        return this.httpMgr.doPost(this.serviceName, "addTopConcept", params, this.oldTypeService, true).map(
            stResp => {
                this.eventHandler.topConceptCreatedEvent.emit({ concept: concept, schemes: [scheme] });
                return { concept: concept, scheme: scheme };
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
            concept: concept,
            scheme: scheme,
        };
        return this.httpMgr.doPost(this.serviceName, "removeTopConcept", params, this.oldTypeService, true).map(
            stResp => {
                this.eventHandler.conceptRemovedAsTopConceptEvent.emit({ concept: concept, scheme: scheme });
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
            concept: concept,
        };
        return this.httpMgr.doPost(this.serviceName, "deleteConcept", params, this.oldTypeService, true).map(
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
     * @param conceptSchemes scheme where new concept should belong
     * @param newConcept URI concept
     * @param conceptCls class of the concept that is creating (a subclass of skos:Concept, if not provided the default is skos:Concept)
     * @param customFormId id of the custom form that set additional info to the concept
     * @param userPromptMap json map object of key - value of the custom form
     * @return the new concept
     */
    createNarrower(label: ARTLiteral, broaderConcept: ARTURIResource, conceptSchemes: ARTURIResource[], newConcept?: ARTURIResource,
        conceptCls?: ARTURIResource, customFormId?: string, userPromptMap?: any) {
        console.log("[SkosServices] createConcept");
        var params: any = {
            label: label,
            conceptSchemes: conceptSchemes,
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
                this.eventHandler.narrowerCreatedEvent.emit({ narrower: newConc, broader: broaderConcept });
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
            concept: concept,
            broaderConcept: broaderConcept,
        };
        return this.httpMgr.doPost(this.serviceName, "addBroaderConcept", params, this.oldTypeService, true).map(
            stResp => {
                //concept doesn't contain info about "more", so when the concept is appended in the tree, it doesn't show the arrow for expand it
                this.eventHandler.broaderAddedEvent.emit({ narrower: concept, broader: broaderConcept });
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
            concept: concept,
            broaderConcept: broaderConcept,
        };
        return this.httpMgr.doPost(this.serviceName, "removeBroaderConcept", params, this.oldTypeService, true).map(
            stResp => {
                this.eventHandler.broaderRemovedEvent.emit({ concept: concept, broader: broaderConcept });
                return stResp;
            }
        );
    }

    /**
     * Adds a concept to a scheme.
     * @param concept 
     * @param scheme
     */
    addConceptToScheme(concept: ARTURIResource, scheme: ARTURIResource) {
        console.log("[SkosServices] addConceptToScheme");
        var params: any = {
            concept: concept,
            scheme: scheme
        };
        return this.httpMgr.doPost(this.serviceName, "addConceptToScheme", params, this.oldTypeService, true);
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
            concept: concept,
            scheme: scheme,
        };
        return this.httpMgr.doPost(this.serviceName, "removeConceptFromScheme", params, this.oldTypeService, true).map(
            stResp => {
                this.eventHandler.conceptRemovedFromSchemeEvent.emit({ concept: concept, scheme: scheme });
                return { concept: concept, scheme: scheme };
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
        return this.httpMgr.doGet(this.serviceName, "getAllSchemes", params, this.oldTypeService, true).map(
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
     * Checks if a scheme is empty
     * @param scheme
     */
    isSchemeEmpty(scheme: ARTURIResource): Observable<boolean> {
        console.log("[SkosServices] isSchemeEmpty");
        var params: any = {
            scheme: scheme
        };
        return this.httpMgr.doGet(this.serviceName, "isSchemeEmpty", params, this.oldTypeService, true);
    }

    /**
     * Deletes a scheme
     * @param scheme the scheme to delete
     */
    deleteConceptScheme(scheme: ARTURIResource) {
        console.log("[SkosServices] deleteConceptScheme");
        var params: any = {
            scheme: scheme
        };
        return this.httpMgr.doPost(this.serviceName, "deleteConceptScheme", params, this.oldTypeService, true);
    }


    //====== Label services ======

    /**
     * Sets a preferred label to the given concept (or scheme)
     * @param concept
     * @param literal label
     */
    setPrefLabel(concept: ARTURIResource, literal: ARTLiteral) {
        console.log("[SkosServices] setPrefLabel");
        var params: any = {
            concept: concept,
            literal: literal
        };
        return this.httpMgr.doPost(this.serviceName, "setPrefLabel", params, this.oldTypeService, true);
    }

    /**
     * Removes a preferred label from the given concept (or scheme).
     * @param concept 
     * @param label label to remove
     * @param lang
     */
    removePrefLabel(concept: ARTURIResource, literal: ARTLiteral) {
        console.log("[SkosServices] removePrefLabel");
        var params: any = {
            concept: concept,
            literal: literal
        };
        return this.httpMgr.doPost(this.serviceName, "removePrefLabel", params, this.oldTypeService, true);
    }

    /**
     * Returns the alternative skos labels for the given concept in the given language
     * @param concept
     * @param language
     */
    getAltLabels(concept: ARTURIResource, language: string) {
        console.log("[SkosServices] getAltLabels");
        var params: any = {
            concept: concept,
            language: language,
        };
        return this.httpMgr.doGet(this.serviceName, "getAltLabels", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createRDFNodeArray(stResp);
            }
        );
    }

    /**
     * Adds an alternative label to the given concept (or scheme)
     * @param concept
     * @param literal label
     */
    addAltLabel(concept: ARTURIResource, literal: ARTLiteral) {
        console.log("[SkosServices] addAltLabel");
        var params: any = {
            concept: concept,
            literal: literal
        };
        return this.httpMgr.doPost(this.serviceName, "addAltLabel", params, this.oldTypeService, true);
    }

    /**
     * Removes an alternative label from the given concept (or scheme)
     * @param concept 
     * @param literal label to remove
     */
    removeAltLabel(concept: ARTURIResource, literal: ARTLiteral) {
        console.log("[SkosServices] removeAltLabel");
        var params: any = {
            concept: concept,
            literal: literal
        };
        return this.httpMgr.doPost(this.serviceName, "removeAltLabel", params, this.oldTypeService, true);
    }

    /**
     * Adds an hidden label to the given concept (or scheme)
     * @param concept
     * @param literal label
     */
    addHiddenLabel(concept: ARTURIResource, literal: ARTLiteral) {
        console.log("[SkosServices] addHiddenLabel");
        var params: any = {
            concept: concept,
            literal: literal
        };
        return this.httpMgr.doPost(this.serviceName, "addHiddenLabel", params, this.oldTypeService, true);
    }

    /**
     * Removes an hidden label from the given concept (or scheme)
     * @param concept 
     * @param literal label to remove
     */
    removeHiddenLabel(concept: ARTURIResource, literal: ARTLiteral) {
        console.log("[SkosServices] removeHiddenLabel");
        var params: any = {
            concept: concept,
            literal: literal,
        };
        return this.httpMgr.doPost(this.serviceName, "removeHiddenLabel", params, this.oldTypeService, true);
    }

    /**
     * Returns an array of all the schemes with the attribute "inScheme" to true if the given concept is in the scheme.
     * @param concept
     */
    getSchemesMatrixPerConcept(concept: ARTURIResource) {
        console.log("[SkosServices] getSchemesMatrixPerConcept");
        var params: any = {
            concept: concept
        };
        return this.httpMgr.doGet(this.serviceName, "getSchemesMatrixPerConcept", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
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
        return this.httpMgr.doGet(this.serviceName, "getRootCollections", params, this.oldTypeService, true).map(
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
        return this.httpMgr.doGet(this.serviceName, "getNestedCollections", params, this.oldTypeService, true).map(
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
     * @param collectioType the type of the collection (skos:Collection or skos:OrderedCollection)
     * @param label the preferred label
     * @param newCollection the (optional) uri of the collection
     * @param collectionCls class of the collection that is creating (a subclass of skos:Collection, if not provided the default is skos:Collection)
     * @param customFormId id of the custom form that set additional info to the collection
     * @param userPromptMap json map object of key - value of the custom form
     * @return the new collection
     */
    createRootCollection(collectionType: ARTURIResource, label: ARTLiteral, newCollection?: ARTURIResource, collectionCls?: ARTURIResource,
        customFormId?: string, userPromptMap?: any) {
        console.log("[SkosServices] createCollection");
        var params: any = {
            collectionType: collectionType,
            label: label
        };
        if (newCollection != null) {
            params.newCollection = newCollection
        }
        if (collectionCls != null) {
            params.collectionCls = collectionCls;
        }
        if (customFormId != null && userPromptMap != null) {
            params.customFormId = customFormId;
            params.userPromptMap = JSON.stringify(userPromptMap);
        }
        return this.httpMgr.doPost(this.serviceName, "createCollection", params, this.oldTypeService, true).map(
            stResp => {
                var newColl = Deserializer.createURI(stResp);
                newColl.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.rootCollectionCreatedEvent.emit(newColl);
                return newColl;
            }
        );
    }

    /**
     * Creates a root collection
     * @param collectioType the type of the collection (skos:Collection or skos:OrderedCollection)
     * @param containingCollection the collection which the new collection is member
     * @param newCollection the (optional) uri of the collection
     * @param collectionCls class of the collection that is creating (a subclass of skos:Collection, if not provided the default is skos:Collection)
     * @param customFormId id of the custom form that set additional info to the collection
     * @param userPromptMap json map object of key - value of the custom form
     * @return the new collection
     */
    createNestedCollection(collectionType: ARTURIResource, containingCollection: ARTURIResource, label: ARTLiteral,
        newCollection?: ARTURIResource, collectionCls?: ARTURIResource, customFormId?: string, userPromptMap?: any) {
        console.log("[SkosServices] createCollection");
        var params: any = {
            collectionType: collectionType,
            containingCollection: containingCollection,
            label: label
        };
        if (newCollection != null) {
            params.newCollection = newCollection
        }
        if (collectionCls != null) {
            params.collectionCls = collectionCls;
        }
        if (customFormId != null && userPromptMap != null) {
            params.customFormId = customFormId;
            params.userPromptMap = JSON.stringify(userPromptMap);
        }
        return this.httpMgr.doPost(this.serviceName, "createCollection", params, this.oldTypeService, true).map(
            stResp => {
                var newColl = Deserializer.createURI(stResp);
                newColl.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.nestedCollectionCreatedEvent.emit({ nested: newColl, container: containingCollection });
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
    addToCollection(collection: ARTResource, element: ARTResource) {
        console.log("[SkosServices] addToCollection");
        var params: any = {
            collection: collection,
            element: element
        };
        return this.httpMgr.doPost(this.serviceName, "addToCollection", params, this.oldTypeService, true).map(
            stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    this.eventHandler.nestedCollectionAddedEvent.emit({ nested: element, container: collection });
                }
                return stResp;
            }
        );
    }

    /**
     * Removes an element from a collection. If the element is a collection, emits a nestedCollectionRemovedEvent.
     * @param collection Collection to which remove the element
     * @param element Collection or Concept to remove
     */
    removeFromCollection(collection: ARTResource, element: ARTResource) {
        console.log("[SkosServices] removeFromCollection");
        var params: any = {
            collection: collection,
            element: element,
        };
        return this.httpMgr.doPost(this.serviceName, "removeFromCollection", params, this.oldTypeService, true).map(
            stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    this.eventHandler.nestedCollectionRemovedEvent.emit({ nested: element, container: collection });
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
            collection: collection,
        };
        return this.httpMgr.doPost(this.serviceName, "deleteCollection", params, this.oldTypeService, true).map(
            stResp => {
                this.eventHandler.collectionDeletedEvent.emit(collection);
                return stResp;
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
    addFirstToOrderedCollection(collection: ARTResource, element: ARTResource) {
        console.log("[SkosServices] addFirstToOrderedCollection");
        var params: any = {
            collection: collection,
            element: element
        };
        return this.httpMgr.doPost(this.serviceName, "addFirstToOrderedCollection", params, this.oldTypeService, true).map(
            stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    this.eventHandler.nestedCollectionAddedFirstEvent.emit({ nested: element, container: collection });
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
    addLastToOrderedCollection(collection: ARTResource, element: ARTResource) {
        console.log("[SkosServices] addLastToOrderedCollection");
        var params: any = {
            collection: collection,
            element: element
        };
        return this.httpMgr.doPost(this.serviceName, "addLastToOrderedCollection", params, this.oldTypeService, true).map(
            stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    this.eventHandler.nestedCollectionAddedLastEvent.emit({ nested: element, container: collection });
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
    addInPositionToOrderedCollection(collection: ARTResource, element: ARTResource, index: number) {
        console.log("[SkosServices] addInPositionToOrderedCollection");
        var params: any = {
            collection: collection,
            element: element,
            index: index
        };
        return this.httpMgr.doPost(this.serviceName, "addInPositionToOrderedCollection", params, this.oldTypeService, true).map(
            stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    this.eventHandler.nestedCollectionAddedInPositionEvent.emit({ nested: element, container: collection, position: index });
                }
                return stResp;
            }
        );
    }

    /**
     * Removes an element from an ordered collection. If the element is a collection, emits a nestedCollectionRemovedEvent.
     * @param collection Collection to which remove the element
     * @param element Collection or Concept to remove
     */
    removeFromOrderedCollection(collection: ARTResource, element: ARTResource) {
        console.log("[SkosServices] removeFromOrderedCollection");
        var params: any = {
            collection: collection,
            element: element
        };
        return this.httpMgr.doPost(this.serviceName, "removeFromOrderedCollection", params, this.oldTypeService, true).map(
            stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    this.eventHandler.nestedCollectionRemovedEvent.emit({ nested: element, container: collection });
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
            collection: collection,
        };
        return this.httpMgr.doPost(this.serviceName, "deleteOrderedCollection", params, this.oldTypeService, true).map(
            stResp => {
                this.eventHandler.collectionDeletedEvent.emit(collection);
                return stResp;
            }
        );
    }

}