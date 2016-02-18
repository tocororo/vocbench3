import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {VBEventHandler} from "../utils/VBEventHandler";

@Injectable()
export class SkosServices {

    private serviceName = "skos";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager, private deserializer: Deserializer, private eventHandler: VBEventHandler) { }
    
    //Concept services 
    
    getTopConcepts(scheme?: string) {
        console.log("[SkosServices] getTopConcepts");
        var params: any = {};
        if (scheme != undefined) {
            params.scheme = scheme;
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

    getNarrowerConcepts(concept: string, scheme: string) {
        console.log("[SkosServices] getNarrowerConcepts");
        var params: any = {
            concept: concept,
            treeView: true,
        };
        if (scheme != undefined) {
            params.scheme = scheme;
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

    createTopConcept(concept: string, scheme: string, prefLabel: string, prefLabelLang: string) {
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

    deleteConcept(concept: string) {
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

    createNarrower(concept: string, broader: string, scheme: string, prefLabel: string, prefLabelLang: string) {
        console.log("[SkosServices] createNarrower");
        var params: any = {
            concept: concept,
            broaderConcept: broader,
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
                this.eventHandler.narrowerCreatedEvent.emit({narrower: newConc, broaderURI: broader});
                return newConc;
            });
    }

    removeBroaderConcept(concept: string, broaderConcept: string) {
        console.log("[SkosServices] removeBroaderConcept");
        var params: any = {
            concept: concept,
            broaderConcept: broaderConcept,
        };
        return this.httpMgr.doGet(this.serviceName, "removeBroaderConcept", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.broaderRemovedEvent.emit({conceptURI: concept, broaderURI: broaderConcept});
                return stResp;
            }
        );
    }

    removeTopConcept(concept: string, scheme: string) {
        console.log("[SkosServices] removeTopConcept");
        var params: any = {
            concept: concept,
            scheme: scheme,
        };
        return this.httpMgr.doGet(this.serviceName, "removeTopConcept", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.conceptRemovedAsTopConceptEvent.emit({conceptURI: concept, schemeURI: scheme});
                return stResp;
            }   
        );
    }

    addConceptToScheme(concept: string, scheme: string, lang?: string) {
        console.log("[SkosServices] addConceptToScheme");
        var params: any = {
            concept: concept,
            scheme: scheme,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "addConceptToScheme", params, this.oldTypeService);
    }

    removeConceptFromScheme(concept: string, scheme: string) {
        console.log("[SkosServices] removeConceptFromScheme");
        var params: any = {
            concept: concept,
            scheme: scheme,
        };
        return this.httpMgr.doGet(this.serviceName, "removeConceptFromScheme", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.conceptRemovedFromSchemeEvent.emit({conceptURI: concept, schemeURI: scheme});
                return stResp;
            }
        );
    }
    
    //Scheme services
    
    getAllSchemesList() {
        console.log("[SkosServices] getAllSchemesList");
        var params: any = {};
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

    deleteScheme(scheme: string, forceDeleteDanglingConcepts?: boolean) {
        console.log("[SkosServices] deleteScheme");
        var params: any = {
            scheme: scheme,
            setForceDeleteDanglingConcepts: forceDeleteDanglingConcepts != undefined,
        };
        if (forceDeleteDanglingConcepts != undefined) {
            params.forceDeleteDanglingConcepts = forceDeleteDanglingConcepts;
        }
        return this.httpMgr.doGet(this.serviceName, "deleteScheme", params, this.oldTypeService);
    }
    
    //Label services
    
    setPrefLabel(concept: string, label: string, lang: string) {
        console.log("[SkosServices] setPrefLabel");
        var params: any = {
            concept: concept,
            label: label,
            lang: lang,
        };
        return this.httpMgr.doGet(this.serviceName, "setPrefLabel", params, this.oldTypeService);
    }
    
    removePrefLabel(concept: string, label: string, lang?: string) {
        console.log("[SkosServices] removePrefLabel");
        var params: any = {
            concept: concept,
            label: label,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "removePrefLabel", params, this.oldTypeService);
	}
    
    addAltLabel(concept: string, label: string, lang: string) {
        console.log("[SkosServices] addAltLabel");
        var params: any = {
            concept: concept,
            label: label,
            lang: lang,
        };
        return this.httpMgr.doGet(this.serviceName, "addAltLabel", params, this.oldTypeService);
    }
    
    removeAltLabel(concept: string, label: string, lang?: string) {
        console.log("[SkosServices] removeAltLabel");
        var params: any = {
            concept: concept,
            label: label,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "removeAltLabel", params, this.oldTypeService);
	}
    
    addHiddenLabel(concept: string, label: string, lang: string) {
        console.log("[SkosServices] addHiddenLabel");
        var params: any = {
            concept: concept,
            label: label,
            lang: lang,
        };
        return this.httpMgr.doGet(this.serviceName, "addHiddenLabel", params, this.oldTypeService);
    }
    
    removeHiddenLabel(concept: string, label: string, lang?: string) {
        console.log("[SkosServices] removeHiddenLabel");
        var params: any = {
            concept: concept,
            label: label,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet(this.serviceName, "removeHiddenLabel", params, this.oldTypeService);
	}

}