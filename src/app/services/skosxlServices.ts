import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { VBEventHandler } from "../utils/VBEventHandler";
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { ARTResource, ARTURIResource, ARTLiteral, ResAttribute, RDFResourceRolesEnum } from "../models/ARTResources";

@Injectable()
export class SkosxlServices {

    private serviceName = "SKOSXL";
    private oldTypeService = false;


    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    //====== Concept services ======

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
        console.log("[SkosxlServices] createConcept");
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
                return { concept: newConc, schemes: conceptSchemes };
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
        console.log("[SkosxlServices] createConcept");
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

    //====== Scheme services ======

    /**
     * Creates a new scheme
     * @param label the lexical form of the pref label
     * @param newScheme the (optional) uri of the scheme
     * @param schemeCls class of the scheme that is creating (a subclass of skos:ConceptScheme, if not provided the default is skos:ConceptScheme)
     * @param customFormId id of the custom form that set additional info to the concept
     * @param userPromptMap json map object of key - value of the custom form
     * @return the new scheme
     */
    createConceptScheme(label: ARTLiteral, newScheme?: ARTURIResource, schemeCls?: ARTURIResource, customFormId?: string, userPromptMap?: any) {
        console.log("[SkosxlServices] createConceptScheme");
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

    //====== Label services ======

    /**
     * Returns the preferred skosxl label for the given concept in the given language
     * @param concept
     * @param lang
     */
    getPrefLabel(concept: ARTURIResource, lang: string) {
        console.log("[SkosxlServices] getPrefLabel");
        var params: any = {
            concept: concept,
            lang: lang
        };
        return this.httpMgr.doGet(this.serviceName, "getPrefLabel", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createRDFResource(stResp[0]);
            }
        );
    }

    /**
     * Sets a preferred label to the given concept (or scheme).
     * @param concept
     * @param literal
     * @param mode available values: uri or bnode
     */
    setPrefLabel(concept: ARTURIResource, literal: ARTLiteral, mode: string) {
        console.log("[SkosxlServices] setPrefLabel");
        var params: any = {
            concept: concept,
            literal: literal,
            mode: mode,
        };
        return this.httpMgr.doPost(this.serviceName, "setPrefLabel", params, this.oldTypeService, true);
    }

    /**
     * Removes a preferred label from the given concept (or scheme).
     * @param concept 
     * @param xlabel label to remove
     */
    removePrefLabel(concept: ARTURIResource, xlabel: ARTResource) {
        console.log("[SkosxlServices] removePrefLabel");
        var params: any = {
            concept: concept,
            xlabel: xlabel,
        };
        return this.httpMgr.doPost(this.serviceName, "removePrefLabel", params, this.oldTypeService, true);
    }

    /**
     * Returns the alternative skosxl labels for the given concept in the given language
     * @param concept
     * @param lang
     */
    getAltLabels(concept: ARTURIResource, lang: string) {
        console.log("[SkosxlServices] getAltLabels");
        var params: any = {
            concept: concept,
            lang: lang,
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
     * @param literal
     * @param mode available values: uri or bnode
     */
    addAltLabel(concept: ARTURIResource, literal: ARTLiteral, mode: string) {
        console.log("[SkosxlServices] addAltLabel");
        var params: any = {
            concept: concept,
            literal: literal,
            mode: mode,
        };
        return this.httpMgr.doPost(this.serviceName, "addAltLabel", params, this.oldTypeService, true);
    }

    /**
     * Removes an alternative label from the given concept (or scheme)
     * @param concept 
     * @param xlabel label to remove
     */
    removeAltLabel(concept: ARTURIResource, xlabel: ARTResource) {
        console.log("[SkosxlServices] removeAltLabel");
        var params: any = {
            concept: concept,
            xlabel: xlabel,
        };
        return this.httpMgr.doPost(this.serviceName, "removeAltLabel", params, this.oldTypeService, true);
    }

    /**
     * Adds an hidden label to the given concept (or scheme)
     * @param concept
     * @param literal
     * @param mode available values: uri or bnode
     */
    addHiddenLabel(concept: ARTURIResource, literal: ARTLiteral, mode: string) {
        console.log("[SkosxlServices] addHiddenLabel");
        var params: any = {
            concept: concept,
            literal: literal,
            mode: mode,
        };
        return this.httpMgr.doPost(this.serviceName, "addHiddenLabel", params, this.oldTypeService, true);
    }

    /**
     * Removes an hidden label from the given concept (or scheme)
     * @param concept 
     * @param xlabel label to remove
     */
    removeHiddenLabel(concept: ARTURIResource, xlabel: ARTResource) {
        console.log("[SkosxlServices] removeHiddenLabel");
        var params: any = {
            concept: concept,
            xlabel: xlabel,
        };
        return this.httpMgr.doPost(this.serviceName, "removeHiddenLabel", params, this.oldTypeService, true);
    }

    /**
     * Updates the info (literal form or language) about an xLabel
     * @param xlabel
     * @param label
     * @param lang
     */
    changeLabelInfo(xlabel: ARTResource, literal: ARTLiteral) {
        console.log("[SkosxlServices] changeLabelInfo");
        var params: any = {
            xlabel: xlabel,
            literal: literal,
        };
        return this.httpMgr.doPost(this.serviceName, "changeLabelInfo", params, this.oldTypeService, true);
    }

    /**
     * Set a preferred label as alternative.
     * @param concept
     * @param xLabel
     */
    prefToAtlLabel(concept: ARTURIResource, xLabel: ARTResource) {
        console.log("[SkosxlServices] prefToAtlLabel");
        var params: any = {
            concept: concept,
            xlabelURI: xLabel
        };
        return this.httpMgr.doPost(this.serviceName, "prefToAtlLabel", params, this.oldTypeService, true);
    }

    /**
     * Set an alternative label as preferred.
     * @param concept
     * @param xLabel
     */
    altToPrefLabel(concept: ARTURIResource, xLabel: ARTResource) {
        console.log("[SkosxlServices] altToPrefLabel");
        var params: any = {
            concept: concept,
            xlabelURI: xLabel
        };
        return this.httpMgr.doPost(this.serviceName, "altToPrefLabel", params, this.oldTypeService, true);
    }

    //====== Collection services ======

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

}