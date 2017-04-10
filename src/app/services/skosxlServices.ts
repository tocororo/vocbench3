import {Injectable} from '@angular/core';
import {VBEventHandler} from "../utils/VBEventHandler";
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {ARTResource, ARTURIResource, ARTLiteral, ResAttribute, RDFResourceRolesEnum} from "../models/ARTResources";

@Injectable()
export class SkosxlServices {

    private serviceName_old = "skosxl";
    private oldTypeService_old = true;

    private serviceName = "SKOSXL";
    private oldTypeService = false;
    

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }
    
    //====== Concept services ======
    
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
        console.log("[SkosxlServices] createConcept");
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
                //the response may contain 2 <uri> elements: one for new created concept and one for new created xLabel
                //parse return and insert in the event just the new concept
                var newConc: ARTURIResource;
                var uriColl: HTMLCollection = stResp.getElementsByTagName("uri");
                var parsedUriColl = Deserializer.createURIArrayGivenList(uriColl);
                for (var i = 0; i < parsedUriColl.length; i++) {
                    if (parsedUriColl[i].getRole() == RDFResourceRolesEnum.concept) {
                        newConc = parsedUriColl[i];
                        break;
                    }
                }
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
     * @param customFormId id of the custom form that set additional info to the concept
     * @param userPromptMap json map object of key - value of the custom form
     * @return 
     */
    createTopConcept_NEW(label: ARTLiteral, conceptScheme: ARTURIResource, newConcept?: ARTURIResource, customFormId?: string, userPromptMap?: any) {
        console.log("[SkosxlServices] createConcept");
        var params: any = {
            label: label,
            conceptScheme: conceptScheme,
        };
        if (newConcept != null) {
            params.newConcept = newConcept
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
        console.log("[SkosxlServices] createNarrower");
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
        return this.httpMgr.doGet(this.serviceName_old, "createConcept", params, this.oldTypeService_old).map(
            stResp => {
                //the response may contain 2 <uri> elements: one for new created concept and one for new created xLabel
                //parse return and insert in the event just the new concept
                var newConc: ARTURIResource;
                var uriColl: HTMLCollection = stResp.getElementsByTagName("uri");
                var parsedUriColl = Deserializer.createURIArrayGivenList(uriColl);
                for (var i = 0; i < parsedUriColl.length; i++) {
                    if (parsedUriColl[i].getRole() == RDFResourceRolesEnum.concept) {
                        newConc = parsedUriColl[i];
                        break;
                    }
                }
                newConc.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.narrowerCreatedEvent.emit({narrower: newConc, broader: broader});
                return newConc;
            });
    }

    /**
     * Creates a narrower of the given concept. Emits a narrowerCreatedEvent with narrower (the created narrower) and broader
     * @param label preferred label of the concept (comprehensive of the lang)
     * @param broaderConcept broader of the new created concept
     * @param conceptScheme scheme where new concept should belong
     * @param newConcept URI concept
     * @param customFormId id of the custom form that set additional info to the concept
     * @param userPromptMap json map object of key - value of the custom form
     * @return the new concept
     */
    createNarrower_NEW(label: ARTLiteral, broaderConcept: ARTURIResource, conceptScheme: ARTURIResource, newConcept?: ARTURIResource,
            customFormId?: string, userPromptMap?: any) {
        console.log("[SkosxlServices] createConcept");
        var params: any = {
            label: label,
            conceptScheme: conceptScheme,
            broaderConcept: broaderConcept
        };
        if (newConcept != null) {
            params.newConcept = newConcept
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
     * Deletes the given concept. Emits a conceptDeletedEvent with the deleted concept
     * @param concept the concept to delete
     */
    deleteConcept(concept: ARTURIResource) {
        console.log("[SkosxlServices] deleteConcept");
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
    
    
    //====== Scheme services ======
    
    /**
     * Creates a new scheme
     * @param label the lexical form of the pref label
     * @param newScheme the (optional) uri of the scheme
     * @param customFormId id of the custom form that set additional info to the concept
     * @param userPromptMap json map object of key - value of the custom form
     * @return the new scheme
     */
    createConceptScheme(label: ARTLiteral, newScheme?: ARTURIResource, customFormId?: string, userPromptMap?: any) {
        console.log("[SkosxlServices] createConceptScheme");
        var params: any = {
            label: label
        };
        if (newScheme != undefined) {
            params.newScheme = newScheme;
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
        console.log("[SkosxlServices] deleteScheme");
        var params: any = {
            scheme: scheme.getURI(),
            setForceDeleteDanglingConcepts: forceDeleteDanglingConcepts != undefined,
        };
        if (forceDeleteDanglingConcepts != undefined) {
            params.forceDeleteDanglingConcepts = forceDeleteDanglingConcepts;
        }
        //last param skips the "Error" alert in case the scheme has concept, so I can handle it in the component
        return this.httpMgr.doGet(this.serviceName_old, "deleteScheme", params, this.oldTypeService_old, false, true);
    }
    
    //====== Label services ======

    /**
     * Returns the preferred skosxl label for the given concept in the given language
     * @param concept
     * @param lang
     */
    getPrefLabel(concept: ARTURIResource, lang: string) {
        console.log("[SkosxlServices] getPrefLabel");
        var params: any = {
            concept: concept.getURI(),
            lang: lang
        };
        return this.httpMgr.doGet(this.serviceName_old, "getPrefLabel", params, this.oldTypeService_old).map(
            stResp => {
                return Deserializer.createRDFResource(stResp.children[0]);
            }
        );
    }
    
    /**
     * Sets a preferred label to the given concept (or scheme). Emits a skosxlPrefLabelSetEvent with
     * resource, label and lang)
     * @param concept
     * @param label lexical value of the label
     * @param lang
     * @param mode available values: uri or bnode
     */
    setPrefLabel(concept: ARTURIResource, label: string, lang: string, mode: string) {
        console.log("[SkosxlServices] setPrefLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
            lang: lang,
            mode: mode,
        };
        return this.httpMgr.doGet(this.serviceName_old, "setPrefLabel", params, this.oldTypeService_old).map(
            stResp => {
                this.eventHandler.skosxlPrefLabelSetEvent.emit({resource: concept, label: label, lang: lang});
                return stResp;
            }
        );
    }
    
    /**
     * Removes a preferred label from the given concept (or scheme). Emits a skosxlPrefLabelRemovedEvent with
     * resource, label and lang)
     * @param concept 
     * @param label label to remove
     * @param lang
     */
    removePrefLabel(concept: ARTURIResource, label: string, lang?: string) {
        console.log("[SkosxlServices] removePrefLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName_old, "removePrefLabel", params, this.oldTypeService_old).map(
            stResp => {
                this.eventHandler.skosxlPrefLabelRemovedEvent.emit({resource: concept, label: label, lang: lang});
                return stResp;
            }
        );
	}

    /**
     * Returns the alternative skosxl labels for the given concept in the given language
     * @param concept
     * @param lang
     */
    getAltLabels(concept: ARTURIResource, lang: string) {
        console.log("[SkosxlServices] getAltLabels");
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
     * @param mode available values: uri or bnode
     */
    addAltLabel(concept: ARTURIResource, label: string, lang: string, mode: string) {
        console.log("[SkosxlServices] addAltLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
            lang: lang,
            mode: mode,
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
        console.log("[SkosxlServices] removeAltLabel");
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
     * @param mode available values: uri or bnode
     */
    addHiddenLabel(concept: ARTURIResource, label: string, lang: string, mode: string) {
        console.log("[SkosxlServices] addHiddenLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
            lang: lang,
            mode: mode,
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
        console.log("[SkosxlServices] removeHiddenLabel");
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
     * Updates the info (literal form or language) about an xLabel
     * @param xLabel
     * @param label
     * @param lang
     */
    changeLabelInfo(xLabel: ARTResource, label: string, lang?: string) {
        console.log("[SkosxlServices] changeLabelInfo");
        var params: any = {
            xlabelURI: xLabel.getNominalValue(),
            label: label,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName_old, "changeLabelInfo", params, this.oldTypeService_old);
    }

    /**
     * Set a preferred label as alternative.
     * @param concept
     * @param xLabel
     */
    prefToAtlLabel(concept: ARTURIResource, xLabel: ARTResource) {
        console.log("[SkosxlServices] prefToAtlLabel");
        var params: any = {
            concept: concept.getURI(),
            xlabelURI: xLabel.getNominalValue()
        };
        return this.httpMgr.doGet(this.serviceName_old, "prefToAtlLabel", params, this.oldTypeService_old);
    }

    /**
     * Set an alternative label as preferred.
     * @param concept
     * @param xLabel
     */
    altToPrefLabel(concept: ARTURIResource, xLabel: ARTResource) {
        console.log("[SkosxlServices] altToPrefLabel");
        var params: any = {
            concept: concept.getURI(),
            xlabelURI: xLabel.getNominalValue()
        };
        return this.httpMgr.doGet(this.serviceName_old, "altToPrefLabel", params, this.oldTypeService_old);
    }

    //====== Collection services ======
    
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
        }
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
        }
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

}