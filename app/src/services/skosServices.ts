import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {VBEventHandler} from "../utils/VBEventHandler";
import {ARTURIResource} from "../utils/ARTResources";

@Injectable()
export class SkosServices {

    private serviceName = "skos";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager, private deserializer: Deserializer, private eventHandler: VBEventHandler) { }
    
    //Concept services 
    
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
                var topConcepts = this.deserializer.createURIArray(stResp);
                for (var i = 0; i < topConcepts.length; i++) {
                    topConcepts[i].setAdditionalProperty("children", []);
                }
                return topConcepts;
            }
        );
    }

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
                var narrower = this.deserializer.createURIArray(stResp);
                for (var i = 0; i < narrower.length; i++) {
                    narrower[i].setAdditionalProperty("children", []);
                }
                return narrower;
            }
        );
    }

    createTopConcept(concept: string, scheme: ARTURIResource, prefLabel: string, prefLabelLang: string) {
        console.log("[SkosServices] createConcept");
        var params: any = {
            concept: concept,
            scheme: scheme,
        };
        if (prefLabel != undefined && prefLabelLang != undefined) {
            params.prefLabel = prefLabel;
            params.prefLabelLang = prefLabelLang;
        }
        return this.httpMgr.doGet(this.serviceName, "createConcept", params, this.oldTypeService).map(
            stResp => {
                var newConc = this.deserializer.createURI(stResp);
                newConc.setAdditionalProperty("children", []);
                this.eventHandler.topConceptCreatedEvent.emit(newConc);
                return newConc;
            });
    }

    deleteConcept(concept: ARTURIResource) {
        console.log("[SkosServices] deleteConcept");
        var params: any = {
            concept: concept,
        };
        return this.httpMgr.doGet(this.serviceName, "deleteConcept", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.conceptDeletedEvent.emit(concept);
                return stResp;
            }
        );
    }

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
                var newConc = this.deserializer.createURI(stResp);
                newConc.setAdditionalProperty("children", []);
                this.eventHandler.narrowerCreatedEvent.emit({narrower: newConc, broader: broader});
                return newConc;
            });
    }

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

    removeConceptFromScheme(concept: ARTURIResource, scheme: ARTURIResource) {
        console.log("[SkosServices] removeConceptFromScheme");
        var params: any = {
            concept: concept.getURI(),
            scheme: scheme.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "removeConceptFromScheme", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.conceptRemovedFromSchemeEvent.emit({concept: concept, scheme: scheme});
                return stResp;
            }
        );
    }
    
    //Scheme services
    
    getAllSchemesList(lang?: string) {
        console.log("[SkosServices] getAllSchemesList");
        var params: any = {};
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "getAllSchemesList", params, this.oldTypeService).map(
            stResp => {
                return this.deserializer.createURIArray(stResp);
            }
        );
    }

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
                var newScheme = this.deserializer.createURI(stResp);
                return newScheme;
            });
    }

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
    
    setPrefLabel(concept: ARTURIResource, label: string, lang: string) {
        console.log("[SkosServices] setPrefLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
            lang: lang,
        };
        return this.httpMgr.doGet(this.serviceName, "setPrefLabel", params, this.oldTypeService);
    }
    
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
    
    addAltLabel(concept: ARTURIResource, label: string, lang: string) {
        console.log("[SkosServices] addAltLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
            lang: lang,
        };
        return this.httpMgr.doGet(this.serviceName, "addAltLabel", params, this.oldTypeService);
    }
    
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
    
    addHiddenLabel(concept: ARTURIResource, label: string, lang: string) {
        console.log("[SkosServices] addHiddenLabel");
        var params: any = {
            concept: concept.getURI(),
            label: label,
            lang: lang,
        };
        return this.httpMgr.doGet(this.serviceName, "addHiddenLabel", params, this.oldTypeService);
    }
    
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