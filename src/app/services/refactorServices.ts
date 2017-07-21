import { Injectable } from '@angular/core';
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBContext } from "../utils/VBContext";
import { VBProperties } from "../utils/VBProperties";
import { ARTURIResource, ARTResource, ResourceUtils, ResAttribute } from "../models/ARTResources";

@Injectable()
export class RefactorServices {

    private serviceName = "Refactor";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler, private preferences: VBProperties) { }

    /**
     * Refactors SKOS data (labels and notes) into SKOSXL
     */
    SKOStoSKOSXL(reifyNotes: boolean) {
        console.log("[RefactorServices] SKOStoSKOSXL");
        var params: any = {
            reifyNotes: reifyNotes
        };
        return this.httpMgr.doGet(this.serviceName, "SKOStoSKOSXL", params, true).map(
            stResp => {
                this.eventHandler.refreshDataBroadcastEvent.emit(null);
            }
        );
    }

    /**
     * Refactors SKOSXL data (labels and notes) into SKOS
     */
    SKOSXLtoSKOS() {
        console.log("[RefactorServices] SKOSXLtoSKOS");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "SKOSXLtoSKOS", params, true).map(
            stResp => {
                this.eventHandler.refreshDataBroadcastEvent.emit(null);
            }
        );
    }

    /**
     * Changes the URI of a resource. Emits a resourceRenamedEvent with the oldResource and the newResource
     * @param oldResource the resource to rename
     * @param newResource the new URI
     * @return the resource with the changed URI
     */
    changeResourceURI(oldResource: ARTURIResource, newResource: ARTURIResource) {
        console.log("[RefactorServices] changeResourceURI");
        var params: any = {
            oldResource: oldResource,
            newResource: newResource
        };
        return this.httpMgr.doGet(this.serviceName, "changeResourceURI", params, true).map(
            stResp => {
                let renamedResource: ARTURIResource = oldResource.clone();
                renamedResource.setURI(newResource.getURI());
                this.eventHandler.resourceRenamedEvent.emit({ oldResource: oldResource, newResource: renamedResource });
            }
        );
    }

    /**
     * Replaces the baseURI with a new one
     * @param targetBaseURI
     * @param sourceBaseURI the baseURI to replace.
     * If not provided the service replace the default baseURI of the repository
     */
    replaceBaseURI(targetBaseURI: string, sourceBaseURI?: string) {
        console.log("[RefactorServices] replaceBaseURI");
        var params: any = {
            targetBaseURI: new ARTURIResource(targetBaseURI)
        }
        if (sourceBaseURI != undefined) {
            params.sourceBaseURI = new ARTURIResource(sourceBaseURI);
        }
        return this.httpMgr.doPost(this.serviceName, "replaceBaseURI", params, true).map(
            stResp => {
                //if the project baseURI was replaced, update it
                if (sourceBaseURI == null || sourceBaseURI == VBContext.getWorkingProject().getBaseURI()) {
                    VBContext.getWorkingProject().setBaseURI(targetBaseURI);
                    this.preferences.setActiveSchemes(null);
                    this.eventHandler.schemeChangedEvent.emit(null);
                }
                this.eventHandler.refreshDataBroadcastEvent.emit(null);
            }
        );
    }

    migrateDefaultGraphToBaseURIGraph(clearDestinationGraph?: boolean) {
        console.log("[RefactorServices] migrateDefaultGraphToBaseURIGraph");
        var params: any = {}
        if (clearDestinationGraph != undefined) {
            params.clearDestinationGraph = clearDestinationGraph;
        }
        return this.httpMgr.doGet(this.serviceName, "migrateDefaultGraphToBaseURIGraph", params, true).map(
            stResp => {
                this.eventHandler.refreshDataBroadcastEvent.emit(null);
            }
        );
    }

    /**
     * @param xLabel the label to move to a new concept
     * @param conceptScheme scheme where new concept belongs
     * @param oldConcept concept that owned the xLabel (if null it is retrieved directly from label)
     * @param newConcept uri of the new concept to spawn (if null the uri will be randomically generated)
     * @param broaderConcept broader of the new created concept (if null the concept will be a top)
     * @param customFormId id of the custom form that set additional info to the concept
     * @param userPromptMap json map object of key - value of the custom form
     */
    spawnNewConceptFromLabel(xLabel: ARTResource, conceptSchemes: ARTURIResource[], oldConcept?: ARTURIResource, 
        newConcept?: ARTURIResource, broaderConcept?: ARTURIResource, 
		customFormId?: string, userPromptMap?: any) {

        console.log("[RefactorServices] spawnNewConceptFromLabel");
        var params: any = {
            xLabel: xLabel,
            conceptSchemes: conceptSchemes,
        }
        if (oldConcept != undefined) {
            params.oldConcept = oldConcept;
        }
        if (newConcept != undefined) {
            params.newConcept = newConcept;
        }
        if (broaderConcept != undefined) {
            params.broaderConcept = broaderConcept;
        }
        if (customFormId != null && userPromptMap != null) {
            params.customFormId = customFormId;
            params.userPromptMap = JSON.stringify(userPromptMap);
        }
        return this.httpMgr.doGet(this.serviceName, "spawnNewConceptFromLabel", params, true).map(
            stResp => {
                if (broaderConcept != null) { //created narrower
                    var newConc = Deserializer.createURI(stResp);
                    newConc.setAdditionalProperty(ResAttribute.CHILDREN, []);
                    this.eventHandler.narrowerCreatedEvent.emit({narrower: newConc, broader: broaderConcept});
                    return newConc;
                } else { //created topConcept
                    var newConc = Deserializer.createURI(stResp);
                    newConc.setAdditionalProperty(ResAttribute.CHILDREN, []);
                    this.eventHandler.topConceptCreatedEvent.emit({concept: newConc, schemes: conceptSchemes});
                    return {concept: newConc, schemes: conceptSchemes};
                }
            }
        );
    }

}