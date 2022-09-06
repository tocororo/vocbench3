import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../models/ARTResources";
import { CustomFormValue } from "../models/CustomForms";
import { MultischemeMode } from '../models/Properties';
import { Deserializer } from "../utils/Deserializer";
import { HttpManager, STRequestParams, VBRequestOptions } from "../utils/HttpManager";
import { VBEventHandler } from "../utils/VBEventHandler";
import { ResourcesServices } from "./resourcesServices";

@Injectable()
export class SkosServices {

    private serviceName = "SKOS";

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler, private resourceService: ResourcesServices) { }

    //====== Concept services ====== 

    /**
     * Returns the topConcepts of the given scheme
     * 
     * Note: timestamp is used in order to handle properly the correct response in case of multiple call to this service.
     * 
     * @param schemes
     * @return an array of top concepts
     */
    getTopConcepts(timestamp: number, schemes?: ARTURIResource[], schemeFilter?: MultischemeMode, 
        broaderProps?: ARTURIResource[], narrowerProps?: ARTURIResource[], includeSubProperties?: boolean, 
        options?: VBRequestOptions): Observable<{ concepts: ARTURIResource[], timestamp: number }> {
        let params: any = {
            schemes: schemes,
            schemeFilter: schemeFilter,
            broaderProps: broaderProps,
            narrowerProps: narrowerProps,
            includeSubProperties: includeSubProperties
        };
        return this.httpMgr.doGet(this.serviceName, "getTopConcepts", params, options).pipe(
            map(stResp => {
                return {
                    concepts: Deserializer.createURIArray(stResp),
                    timestamp: timestamp
                };
            })
        );
    }

    /**
     * 
     * @param schemes 
     * @param schemeFilter 
     * @param broaderProps 
     * @param narrowerProps 
     * @param includeSubProperties 
     * @param options 
     */
    countTopConcepts(timestamp: number, schemes?: ARTURIResource[], schemeFilter?: MultischemeMode, 
        broaderProps?: ARTURIResource[], narrowerProps?: ARTURIResource[], includeSubProperties?: boolean, 
        options?: VBRequestOptions): Observable<{ count: number, timestamp: number }> {
        let params: any = {
            schemes: schemes,
            schemeFilter: schemeFilter,
            broaderProps: broaderProps,
            narrowerProps: narrowerProps,
            includeSubProperties: includeSubProperties
        };
        return this.httpMgr.doGet(this.serviceName, "countTopConcepts", params, options).pipe(
            map(stResp => {
                return {
                    count: stResp,
                    timestamp: timestamp
                };
            })
        );
    }

    /**
     * Returns the narrowers of the given concept
     * @param concept
     * @param schemes schemes where the narrower should belong
     * @return an array of narrowers
     */
    getNarrowerConcepts(concept: ARTURIResource, schemes?: ARTURIResource[], schemeFilter?: MultischemeMode, 
        broaderProps?: ARTURIResource[], narrowerProps?: ARTURIResource[], includeSubProperties?: boolean, 
        options?: VBRequestOptions): Observable<ARTURIResource[]> {
        let params: any = {
            concept: concept,
            schemes: schemes,
            schemeFilter: schemeFilter,
            broaderProps: broaderProps,
            narrowerProps: narrowerProps,
            includeSubProperties: includeSubProperties
        };
        return this.httpMgr.doGet(this.serviceName, "getNarrowerConcepts", params, options).pipe(
            map(stResp => {
                return Deserializer.createURIArray(stResp);
            })
        );
    }

    /**
     * Returns the broaders of the given concept
     * @param concept
     * @param schemes schemes where the broaders should belong
     * @return an array of broaders
     */
    getBroaderConcepts(concept: ARTURIResource, schemes: ARTURIResource[], schemeFilter?: MultischemeMode, 
        broaderProps?: ARTURIResource[], narrowerProps?: ARTURIResource[], includeSubProperties?: boolean) {
        let params: any = {
            concept: concept,
            schemes: schemes,
            schemeFilter: schemeFilter,
            broaderProps: broaderProps,
            narrowerProps: narrowerProps,
            includeSubProperties: includeSubProperties
        };
        return this.httpMgr.doGet(this.serviceName, "getBroaderConcepts", params).pipe(
            map(stResp => {
                return Deserializer.createURIArray(stResp);
            })
        );
    }

    /**
     * Creates a concept in the given scheme. If a broader concept is provided, the new concept will be a narrower of that, 
     * otherwise it will be a top concept.
     * NB: although the service server-side has both label and newConcept optional, here only newConcept is optional,
     * so the user is forced to write at least the label.
     * @param label preferred label of the concept (comprehensive of the lang)
     * @param conceptSchemes scheme where new concept should belong
     * @param newConcept URI concept
     * @param broaderConcept broader of the new created concept. If provided, the serivce creates a narrower
     * @param conceptCls class of the concept that is creating (a subclass of skos:Concept, if not provided the default is skos:Concept)
     * @param broaderProp property for creating a subConcept
     * @param checkExistingAltLabel enables the check of clash between existing labels and the new concept's label (default true)
     * @param customFormValue custom form that set additional info to the concept
     * @return 
     */
    createConcept(label: ARTLiteral, conceptSchemes: ARTURIResource[], newConcept?: ARTURIResource, broaderConcept?: ARTURIResource, 
        conceptCls?: ARTURIResource, broaderProp?: ARTURIResource, customFormValue?: CustomFormValue, 
        checkExistingAltLabel?: boolean, checkExistingPrefLabel?: boolean) {
        let params: any = {
            label: label,
            conceptSchemes: conceptSchemes,
            newConcept: newConcept,
            broaderConcept: broaderConcept,
            conceptCls: conceptCls,
            broaderProp: broaderProp,
            checkExistingAltLabel: checkExistingAltLabel,
            checkExistingPrefLabel: checkExistingPrefLabel,
            customFormValue: customFormValue

        };
        let options: VBRequestOptions = new VBRequestOptions({
            errorHandlers: [
                { className: 'it.uniroma2.art.semanticturkey.exceptions.PrefAltLabelClashException', action: 'skip' },
                { className: 'it.uniroma2.art.semanticturkey.exceptions.PrefPrefLabelClashException', action: 'skip' },
                { className: 'it.uniroma2.art.semanticturkey.exceptions.BlacklistForbiddendException', action: 'skip' },
            ]
        });
        return this.httpMgr.doPost(this.serviceName, "createConcept", params, options).pipe(
            map(stResp => {
                return Deserializer.createURI(stResp);
            })
        ).pipe(
            mergeMap(concept => {
                return this.resourceService.getResourceDescription(concept).pipe(
                    map(resource => {
                        resource.setAdditionalProperty(ResAttribute.NEW, true);
                        if (broaderConcept != null) {
                            this.eventHandler.narrowerCreatedEvent.emit({ narrower: <ARTURIResource>resource, broader: broaderConcept });
                        } else {
                            this.eventHandler.topConceptCreatedEvent.emit({ concept: <ARTURIResource>resource, schemes: conceptSchemes });
                        }
                        return <ARTURIResource>resource;
                    })
                );
            })
        );
    }

    /**
     * Set a concept as top concept of a scheme. Emits a topConceptAddedEvent with concept and scheme
     * @param concept concept to set as top concept
     * @param scheme where to add the top concept
     * @return object with concept and scheme
     */
    addTopConcept(concept: ARTURIResource, scheme: ARTURIResource, topConceptProp?: ARTURIResource) {
        let params: any = {
            concept: concept,
            scheme: scheme,
            topConceptProp: topConceptProp ? topConceptProp : null
        };
        return this.httpMgr.doPost(this.serviceName, "addTopConcept", params).pipe(
            map(() => {
                this.eventHandler.topConceptCreatedEvent.emit({ concept: concept, schemes: [scheme] });
                return { concept: concept, scheme: scheme };
            })
        );
    }

    /**
     * Removes the given concept as top concept of a scheme. Emit a conceptRemovedAsTopConceptEvent with concept and scheme.
     * @param concept the top concept
     * @param scheme
     */
    removeTopConcept(concept: ARTURIResource, scheme: ARTURIResource) {
        let params: any = {
            concept: concept,
            scheme: scheme,
        };
        return this.httpMgr.doPost(this.serviceName, "removeTopConcept", params).pipe(
            map(stResp => {
                this.eventHandler.conceptRemovedAsTopConceptEvent.emit({ concept: concept, scheme: scheme });
                return stResp;
            })
        );
    }

    /**
     * Deletes the given concept. Emits a conceptDeletedEvent with the deleted concept
     * @param concept the concept to delete
     */
    deleteConcept(concept: ARTURIResource) {
        let params: any = {
            concept: concept,
        };
        return this.httpMgr.doPost(this.serviceName, "deleteConcept", params).pipe(
            map(stResp => {
                this.eventHandler.conceptDeletedEvent.emit(concept);
                return stResp;
            })
        );
    }

    /**
     * Adds the broader relation between two concepts. Emits a narrowerAddedEvent with narrower and broader
     * @param concept concept to which add the broader
     * @param broaderConcept the broader concept
     */
    addBroaderConcept(concept: ARTURIResource, broaderConcept: ARTURIResource, broaderProp?: ARTURIResource) {
        let params: any = {
            concept: concept,
            broaderConcept: broaderConcept,
            broaderProp: broaderProp ? broaderProp : null
        };
        return this.httpMgr.doPost(this.serviceName, "addBroaderConcept", params).pipe(
            map(stResp => {
                //concept doesn't contain info about "more", so when the concept is appended in the tree, it doesn't show the arrow for expand it
                this.eventHandler.broaderAddedEvent.emit({ narrower: concept, broader: broaderConcept });
                return stResp;
            })
        );
    }

    /**
     * Removes a broader from the given concept. Emits a broaderRemovedEvent with concept and broader (the removed broader)
     * @param concept 
     * @param broaderConcept broader to remove
     */
    removeBroaderConcept(concept: ARTURIResource, broaderConcept: ARTURIResource) {
        let params: any = {
            concept: concept,
            broaderConcept: broaderConcept,
        };
        return this.httpMgr.doPost(this.serviceName, "removeBroaderConcept", params).pipe(
            map(stResp => {
                this.eventHandler.broaderRemovedEvent.emit({ concept: concept, broader: broaderConcept });
                return stResp;
            })
        );
    }

    /**
     * Adds a concept to a scheme.
     * @param concept 
     * @param scheme
     */
    addConceptToScheme(concept: ARTURIResource, scheme: ARTURIResource) {
        let params: any = {
            concept: concept,
            scheme: scheme
        };
        return this.httpMgr.doPost(this.serviceName, "addConceptToScheme", params);
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
        let params: any = {
            concept: concept,
            scheme: scheme,
        };
        return this.httpMgr.doPost(this.serviceName, "removeConceptFromScheme", params).pipe(
            map(stResp => {
                this.eventHandler.conceptRemovedFromSchemeEvent.emit({ concept: concept, scheme: scheme });
                return { concept: concept, scheme: scheme };
            })
        );
    }

    /**
     * Perform a mass assignement of a set of concepts to a scheme.
     * This service takes as parameter the ConceptScheme to which the concepts should be added.
     * The set of concepts can be determined by providing a root concept, in this way that concept and its subtree is added to the scheme, 
     * or by not providing any concept at all so that all the existing concepts are moved in the scheme.
     * 
     * @param scheme 
     * @param rootConcept 
     * @param inSchemeProp 
     * @param broaderProps 
     * @param narrowerProps 
     * @param includeSubProperties 
     * @param filterSchemes 
     */
    addMultipleConceptsToScheme(scheme: ARTURIResource, rootConcept?: ARTURIResource,
        inSchemeProp?: ARTURIResource, broaderProps?: ARTURIResource[], narrowerProps?: ARTURIResource[], 
        includeSubProperties?: boolean, filterSchemes?: ARTURIResource[], setTopConcept?: boolean) {
        let params: any = {
            scheme: scheme,
            rootConcept: rootConcept,
            inSchemeProp: inSchemeProp,
            broaderProps: broaderProps,
            narrowerProps: narrowerProps,
            includeSubProperties: includeSubProperties,
            filterSchemes: filterSchemes,
            setTopConcept: setTopConcept
        };
        return this.httpMgr.doPost(this.serviceName, "addMultipleConceptsToScheme", params);
    }

    //====== Scheme services ======

    /**
     * Returns the list of available skos:ConceptScheme (New service)
     * @return an array of schemes
     */
    getAllSchemes(options?: VBRequestOptions) {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getAllSchemes", params, options).pipe(
            map(stResp => {
                return Deserializer.createURIArray(stResp);
            })
        );
    }

    /**
     * Creates a new scheme
     * @param label the lexical form of the pref label
     * @param newScheme the (optional) uri of the scheme
     * @param schemeCls class of the scheme that is creating (a subclass of skos:ConceptScheme, if not provided the default is skos:ConceptScheme)
     * @param checkExistingAltLabel enables the check of clash between existing labels and the new scheme's label (default true)
     * @param customFormValue custom form that set additional info to the concept
     * @return the new scheme
     */
    createConceptScheme(label: ARTLiteral, newScheme?: ARTURIResource, schemeCls?: ARTURIResource,
            customFormValue?: CustomFormValue, checkExistingAltLabel?: boolean): Observable<ARTURIResource> {
        let params: STRequestParams = {
            label: label,
            newScheme: newScheme,
            schemeCls: schemeCls,
            checkExistingAltLabel: checkExistingAltLabel,
            customFormValue: customFormValue
        };
        let options: VBRequestOptions = new VBRequestOptions({
            errorHandlers: [
                { className: 'it.uniroma2.art.semanticturkey.exceptions.PrefAltLabelClashException', action: 'skip' },
            ]
        });
        return this.httpMgr.doPost(this.serviceName, "createConceptScheme", params, options).pipe(
            map(stResp => {
                return Deserializer.createURI(stResp);
            })
        ).pipe(
            mergeMap(scheme => {
                return this.resourceService.getResourceDescription(scheme).pipe(
                    map(resource => {
                        resource.setAdditionalProperty(ResAttribute.NEW, true);
                        this.eventHandler.schemeCreatedEvent.emit(<ARTURIResource>resource);
                        return <ARTURIResource>resource;
                    })
                );
            })
        );
    }

    /**
     * Checks if a scheme is empty
     * @param scheme
     */
    isSchemeEmpty(scheme: ARTURIResource): Observable<boolean> {
        let params: any = {
            scheme: scheme
        };
        return this.httpMgr.doGet(this.serviceName, "isSchemeEmpty", params);
    }

    /**
     * Deletes a scheme
     * @param scheme the scheme to delete
     */
    deleteConceptScheme(scheme: ARTURIResource) {
        let params: any = {
            scheme: scheme
        };
        return this.httpMgr.doPost(this.serviceName, "deleteConceptScheme", params).pipe(
            map(stResp => {
                this.eventHandler.schemeDeletedEvent.emit(scheme);
                return stResp;
            })
        );
    }


    //====== Label services ======

    /**
     * Sets a preferred label to the given concept (or scheme)
     * @param concept
     * @param literal label
     * @param checkExistingAltLabel enables the check of clash between existing labels and the new created (default true)
     */
    setPrefLabel(concept: ARTURIResource, literal: ARTLiteral, checkExistingAltLabel?: boolean, checkExistingPrefLabel?: boolean,) {
        let params: any = {
            concept: concept,
            literal: literal,
            checkExistingAltLabel: checkExistingAltLabel,
            checkExistingPrefLabel: checkExistingPrefLabel
        };
        let options: VBRequestOptions = new VBRequestOptions({
            errorHandlers: [
                { className: 'it.uniroma2.art.semanticturkey.exceptions.PrefAltLabelClashException', action: 'skip' },
                { className: 'it.uniroma2.art.semanticturkey.exceptions.PrefPrefLabelClashException', action: 'skip' },
                { className: 'it.uniroma2.art.semanticturkey.exceptions.BlacklistForbiddendException', action: 'skip' },
            ]
        });
        return this.httpMgr.doPost(this.serviceName, "setPrefLabel", params, options);
    }

    /**
     * Removes a preferred label from the given concept (or scheme).
     * @param concept 
     * @param label label to remove
     * @param lang
     */
    removePrefLabel(concept: ARTURIResource, literal: ARTLiteral) {
        let params: any = {
            concept: concept,
            literal: literal
        };
        return this.httpMgr.doPost(this.serviceName, "removePrefLabel", params);
    }

    /**
     * Returns the alternative skos labels for the given concept in the given language
     * @param concept
     * @param language
     */
    getAltLabels(concept: ARTURIResource, language: string) {
        let params: any = {
            concept: concept,
            language: language,
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
     * @param literal label
     */
    addAltLabel(concept: ARTURIResource, literal: ARTLiteral) {
        let params: any = {
            concept: concept,
            literal: literal
        };
        let options: VBRequestOptions = new VBRequestOptions({
            errorHandlers: [
                { className: 'it.uniroma2.art.semanticturkey.exceptions.BlacklistForbiddendException', action: 'skip' },
                { className: 'it.uniroma2.art.semanticturkey.exceptions.AltPrefLabelClashException', action: 'warning' } //addAltLabel cannot be forced, so just show a warning
            ]
        });
        return this.httpMgr.doPost(this.serviceName, "addAltLabel", params, options);
    }

    /**
     * Removes an alternative label from the given concept (or scheme)
     * @param concept 
     * @param literal label to remove
     */
    removeAltLabel(concept: ARTURIResource, literal: ARTLiteral) {
        let params: any = {
            concept: concept,
            literal: literal
        };
        return this.httpMgr.doPost(this.serviceName, "removeAltLabel", params);
    }

    /**
     * Adds an hidden label to the given concept (or scheme)
     * @param concept
     * @param literal label
     */
    addHiddenLabel(concept: ARTURIResource, literal: ARTLiteral) {
        let params: any = {
            concept: concept,
            literal: literal
        };
        let options: VBRequestOptions = new VBRequestOptions({
            errorHandlers: [
                { className: 'it.uniroma2.art.semanticturkey.exceptions.BlacklistForbiddendException', action: 'skip' },
            ]
        });
        return this.httpMgr.doPost(this.serviceName, "addHiddenLabel", params, options);
    }

    /**
     * Removes an hidden label from the given concept (or scheme)
     * @param concept 
     * @param literal label to remove
     */
    removeHiddenLabel(concept: ARTURIResource, literal: ARTLiteral) {
        let params: any = {
            concept: concept,
            literal: literal,
        };
        return this.httpMgr.doPost(this.serviceName, "removeHiddenLabel", params);
    }

    /**
     * Returns an array of all the schemes with the attribute "inScheme" to true if the given concept is in the scheme.
     * @param concept
     */
    getSchemesMatrixPerConcept(concept: ARTURIResource) {
        let params: any = {
            concept: concept
        };
        return this.httpMgr.doGet(this.serviceName, "getSchemesMatrixPerConcept", params).pipe(
            map(stResp => {
                return Deserializer.createURIArray(stResp);
            })
        );
    }

    /**
     * Returns an array of schemes of the given concept. This invokes the same getSchemesMatrixPerConcept service,
     * but it filters out the schemes with attribute "inScheme" false
     * @param concept
     */
    getSchemesOfConcept(concept: ARTURIResource): Observable<ARTURIResource[]> {
        let params: any = {
            concept: concept
        };
        return this.httpMgr.doGet(this.serviceName, "getSchemesMatrixPerConcept", params).pipe(
            map(stResp => {
                let allSchemes: ARTURIResource[] = Deserializer.createURIArray(stResp);
                let schemes: ARTURIResource[] = [];
                allSchemes.forEach((s: ARTURIResource) => {
                    if (s.getAdditionalProperty(ResAttribute.IN_SCHEME)) {
                        schemes.push(s);
                    }
                });
                return schemes;
            })
        );
    }

    //====== Collection services ======

    /**
     * Gets the root collections
     */
    getRootCollections(options?: VBRequestOptions) {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getRootCollections", params, options).pipe(
            map(stResp => {
                return Deserializer.createURIArray(stResp);
            })
        );
    }

    /**
     * Get the nested collections of a container collection
     * @param container the URI of the container collection
     */
    getNestedCollections(container: ARTResource, options?: VBRequestOptions): Observable<ARTURIResource[]> {
        let params: any = {
            container: container
        };
        return this.httpMgr.doGet(this.serviceName, "getNestedCollections", params, options).pipe(
            map(stResp => {
                return Deserializer.createURIArray(stResp);
            })
        );
    }

    getSuperCollections(collection: ARTURIResource): Observable<ARTURIResource[]> {
        let params = {
            collection: collection
        };
        return this.httpMgr.doGet(this.serviceName, "getSuperCollections", params).pipe(
            map(stResp => {
                return Deserializer.createURIArray(stResp);
            })
        );
    }

    /**
     * Creates a collection. If a container collection is provided, the created one will be a nested collection, otherwise it will be 
     * a root collection.
     * @param collectioType the type of the collection (skos:Collection or skos:OrderedCollection)
     * @param label the preferred label
     * @param newCollection the (optional) uri of the collection
     * @param containingCollection the parent collection. If provided the new collection will be nested of this one.
     * @param collectionCls class of the collection that is creating (a subclass of skos:Collection, if not provided the default is skos:Collection)
     * @param checkExistingAltLabel enables the check of clash between existing labels and the new collection's label (default true)
     * @param customFormValue custom form that set additional info to the collection
     * @return the new collection
     */
    createCollection(collectionType: ARTURIResource, label: ARTLiteral, newCollection?: ARTURIResource, containingCollection?: ARTURIResource,
        collectionCls?: ARTURIResource, customFormValue?: CustomFormValue, checkExistingAltLabel?: boolean) {
        let params: any = {
            collectionType: collectionType,
            label: label
        };
        if (newCollection != null) {
            params.newCollection = newCollection;
        }
        if (containingCollection != null) {
            params.containingCollection = containingCollection;
        }
        if (collectionCls != null) {
            params.collectionCls = collectionCls;
        }
        if (checkExistingAltLabel != null) {
            params.checkExistingAltLabel = checkExistingAltLabel;
        }
        if (customFormValue != null) {
            params.customFormValue = customFormValue;
        }
        let options: VBRequestOptions = new VBRequestOptions({
            errorHandlers: [
                { className: 'it.uniroma2.art.semanticturkey.exceptions.PrefAltLabelClashException', action: 'skip' },
                { className: 'it.uniroma2.art.semanticturkey.exceptions.PrefPrefLabelClashException', action: 'skip' },
            ]
        });
        return this.httpMgr.doPost(this.serviceName, "createCollection", params, options).pipe(
            map(stResp => {
                return Deserializer.createURI(stResp);
            })
        ).pipe(
            mergeMap(collection => {
                return this.resourceService.getResourceDescription(collection).pipe(
                    map(resource => {
                        resource.setAdditionalProperty(ResAttribute.NEW, true);
                        if (containingCollection != null) {
                            this.eventHandler.nestedCollectionCreatedEvent.emit({ nested: resource, container: containingCollection });
                        } else {
                            this.eventHandler.rootCollectionCreatedEvent.emit(resource);
                        }
                        return resource;
                    })
                );
            })
        );
    }

    /**
     * Adds an element to a collection. If the element is a collection, emits a nestedCollectionAddedEvent
     * @param collection Collection to which add the element
     * @param element Collection or Concept to add
     * @param lang language used to render the added element in the response
     */
    addToCollection(collection: ARTResource, element: ARTResource) {
        let params: any = {
            collection: collection,
            element: element
        };
        return this.httpMgr.doPost(this.serviceName, "addToCollection", params).pipe(
            map(stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    this.eventHandler.nestedCollectionAddedEvent.emit({ nested: element, container: collection });
                }
                return stResp;
            })
        );
    }

    /**
     * Removes an element from a collection. If the element is a collection, emits a nestedCollectionRemovedEvent.
     * @param collection Collection to which remove the element
     * @param element Collection or Concept to remove
     */
    removeFromCollection(collection: ARTResource, element: ARTResource) {
        let params: any = {
            collection: collection,
            element: element,
        };
        return this.httpMgr.doPost(this.serviceName, "removeFromCollection", params).pipe(
            map(stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    this.eventHandler.nestedCollectionRemovedEvent.emit({ nested: element, container: collection });
                }
                return stResp;
            })
        );
    }

    /**
     * Deletes a collection. Emits a collectionDeletedEvent
     * @param collection Collection to delete
     */
    deleteCollection(collection: ARTURIResource) {
        let params: any = {
            collection: collection,
        };
        return this.httpMgr.doPost(this.serviceName, "deleteCollection", params).pipe(
            map(stResp => {
                this.eventHandler.collectionDeletedEvent.emit(collection);
                return stResp;
            })
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
        let params: any = {
            collection: collection,
            element: element
        };
        return this.httpMgr.doPost(this.serviceName, "addFirstToOrderedCollection", params).pipe(
            map(stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    this.eventHandler.nestedCollectionAddedFirstEvent.emit({ nested: element, container: collection });
                }
                return stResp;
            })
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
        let params: any = {
            collection: collection,
            element: element
        };
        return this.httpMgr.doPost(this.serviceName, "addLastToOrderedCollection", params).pipe(
            map(stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    this.eventHandler.nestedCollectionAddedLastEvent.emit({ nested: element, container: collection });
                }
                return stResp;
            })
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
        let params: any = {
            collection: collection,
            element: element,
            index: index
        };
        return this.httpMgr.doPost(this.serviceName, "addInPositionToOrderedCollection", params).pipe(
            map(stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    this.eventHandler.nestedCollectionAddedInPositionEvent.emit({ nested: element, container: collection, position: index });
                }
                return stResp;
            })
        );
    }

    /**
     * Removes an element from an ordered collection. If the element is a collection, emits a nestedCollectionRemovedEvent.
     * @param collection Collection to which remove the element
     * @param element Collection or Concept to remove
     */
    removeFromOrderedCollection(collection: ARTResource, element: ARTResource) {
        let params: any = {
            collection: collection,
            element: element
        };
        return this.httpMgr.doPost(this.serviceName, "removeFromOrderedCollection", params).pipe(
            map(stResp => {
                if (element.getRole() == RDFResourceRolesEnum.skosCollection ||
                    element.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
                    this.eventHandler.nestedCollectionRemovedEvent.emit({ nested: element, container: collection });
                }
                return stResp;
            })
        );
    }

    /**
     * Deletes an ordered collection. Emits a collectionDeletedEvent
     * @param collection Collection to delete
     */
    deleteOrderedCollection(collection: ARTURIResource) {
        let params: any = {
            collection: collection,
        };
        return this.httpMgr.doPost(this.serviceName, "deleteOrderedCollection", params).pipe(
            map(stResp => {
                this.eventHandler.collectionDeletedEvent.emit(collection);
                return stResp;
            })
        );
    }

    /**
     * Adds a note
     * @param resource
     * @param predicate
     * @param value
     */
    addNote(resource: ARTResource, predicate: ARTURIResource, value: ARTNode | CustomFormValue) {
        let params: any = {
            resource: resource,
            predicate: predicate,
            value: value
        };
        return this.httpMgr.doPost(this.serviceName, "addNote", params);
    }


    removeNote(resource: ARTResource, predicate: ARTURIResource, value: ARTNode) {
        let params: any = {
            resource: resource,
            predicate: predicate,
            value: value
        };
        return this.httpMgr.doPost(this.serviceName, "removeNote", params);
    }

    updateNote(resource: ARTResource, predicate: ARTURIResource, value: ARTNode, newValue: ARTNode) {
        let params: any = {
            resource: resource,
            predicate: predicate,
            value: value,
            newValue: newValue
        };
        return this.httpMgr.doPost(this.serviceName, "updateNote", params);
    }

}