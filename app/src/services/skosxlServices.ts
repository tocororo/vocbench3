import {Injectable} from '@angular/core';
import {VBEventHandler} from "../utils/VBEventHandler";
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {ARTURIResource, ResAttribute, RDFResourceRolesEnum} from "../utils/ARTResources";

@Injectable()
export class SkosxlServices {

    private serviceName = "skosxl";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }
    
    //Concept services
    
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
        console.log("[SkosxlServices] createConcept");
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
                //the response may contain 2 <uri> elements: one for new created concept and one for new created xLabel
                //parse return and insert in the event just the new concept
                var newConc: ARTURIResource;
                var uriColl: Array<Element> = stResp.getElementsByTagName("uri");
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
        console.log("[SkosxlServices] createNarrower");
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
                //the response may contain 2 <uri> elements: one for new created concept and one for new created xLabel
                //parse return and insert in the event just the new concept
                var newConc: ARTURIResource;
                var uriColl: Array<Element> = stResp.getElementsByTagName("uri");
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
     * Deletes the given concept. Emits a conceptDeletedEvent with the deleted concept
     * @param concept the concept to delete
     */
    deleteConcept(concept: ARTURIResource) {
        console.log("[SkosxlServices] deleteConcept");
        var params: any = {
            concept: concept.getURI(),
        };
        /* TODO due to a lack of ST, at the moment call the SKOS.deleteConcept service 
          which however doesn't delete the skosxl:Label of the concept.
          Change it as soon as the service will be implemented. */  
        // return this.httpMgr.doGet(this.serviceName, "deleteConcept", params, this.oldTypeService).map(
        return this.httpMgr.doGet("skos", "deleteConcept", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.conceptDeletedEvent.emit(concept);
                return stResp;
            }
        );
    }
    
    
    //Scheme services
    
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
        console.log("[SkosxlServices] createScheme");
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
        console.log("[SkosxlServices] deleteScheme");
        var params: any = {
            scheme: scheme.getURI(),
            setForceDeleteDanglingConcepts: forceDeleteDanglingConcepts != undefined,
        };
        if (forceDeleteDanglingConcepts != undefined) {
            params.forceDeleteDanglingConcepts = forceDeleteDanglingConcepts;
        }
        /* TODO due to a lack of ST, at the moment call the SKOS.deleteScheme service 
          which however doesn't delete the skosxl:Label of the concept.
          Change it as soon as the service will be implemented. */  
        
        //last param skips the "Error" alert in case the scheme has concept, so I can handle it in the component
        // return this.httpMgr.doGet(this.serviceName, "deleteScheme", params, this.oldTypeService, false, true);
        return this.httpMgr.doGet("skos", "deleteScheme", params, this.oldTypeService, false, true);
    }
    
    //Label services
    
    /**
     * Sets a preferred label to the given concept
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
        return this.httpMgr.doGet(this.serviceName, "setPrefLabel", params, this.oldTypeService);
    }
    
    /**
     * Removes a preferred label from the given concept
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
        return this.httpMgr.doGet(this.serviceName, "removePrefLabel", params, this.oldTypeService);
	}
    
    /**
     * Adds an alternative label to the given concept
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
        return this.httpMgr.doGet(this.serviceName, "addAltLabel", params, this.oldTypeService);
    }
    
    /**
     * Removes an alternative label from the given concept
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
        return this.httpMgr.doGet(this.serviceName, "removeAltLabel", params, this.oldTypeService);
	}
    
    /**
     * Adds an hidden label to the given concept
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
        return this.httpMgr.doGet(this.serviceName, "addHiddenLabel", params, this.oldTypeService);
    }
    
    /**
     * Removes an hidden label from the given concept
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
        return this.httpMgr.doGet(this.serviceName, "removeHiddenLabel", params, this.oldTypeService);
	}

}