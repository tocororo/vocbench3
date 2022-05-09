import { Injectable } from '@angular/core';
import { map, mergeMap } from 'rxjs/operators';
import { ARTResource, ARTURIResource, ResAttribute } from "../models/ARTResources";
import { CustomFormValue } from "../models/CustomForms";
import { ResourcesServices } from "../services/resourcesServices";
import { Deserializer } from "../utils/Deserializer";
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { VBContext } from "../utils/VBContext";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties } from "../utils/VBProperties";

@Injectable()
export class RefactorServices {

    private serviceName = "Refactor";

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler, private vbProp: VBProperties,
        private resourceService: ResourcesServices) { }

    /**
     * Refactors SKOS data (labels and notes) into SKOSXL
     */
    SKOStoSKOSXL(reifyNotes: boolean) {
        let params: any = {
            reifyNotes: reifyNotes
        };
        return this.httpMgr.doGet(this.serviceName, "SKOStoSKOSXL", params).pipe(
            map(stResp => {
                this.eventHandler.refreshDataBroadcastEvent.emit(null);
            })
        );
    }

    /**
     * Refactors SKOSXL data (labels and notes) into SKOS
     */
    SKOSXLtoSKOS(flattenNotes: boolean) {
        let params: any = {
            flattenNotes: flattenNotes
        };
        return this.httpMgr.doGet(this.serviceName, "SKOSXLtoSKOS", params).pipe(
            map(stResp => {
                this.eventHandler.refreshDataBroadcastEvent.emit(null);
            })
        );
    }

    /**
     * Changes the URI of a resource. Emits a resourceRenamedEvent with the oldResource and the newResource
     * @param oldResource the resource to rename
     * @param newResource the new URI
     * @return the resource with the changed URI
     */
    changeResourceURI(oldResource: ARTURIResource, newResource: ARTURIResource) {
        let params: any = {
            oldResource: oldResource,
            newResource: newResource
        };
        return this.httpMgr.doGet(this.serviceName, "changeResourceURI", params).pipe(
            mergeMap(stResp => {
                return this.resourceService.getResourceDescription(newResource).pipe(
                    map(newRes => {
                        /**
                         * create a clone to avoid that changes on oldResource (in onResourceRenamed of ResView),
                         * changes also the oldResource in the event
                         */
                        let oldRes = new ARTURIResource(oldResource.getURI());
                        this.eventHandler.resourceRenamedEvent.emit({ oldResource: oldRes, newResource: <ARTURIResource>newRes });
                        return stResp;
                    })
                );
            })
        );
    }

    /**
     * Replaces the baseURI with a new one
     * @param targetBaseURI
     * @param sourceBaseURI the baseURI to replace.
     * If not provided the service replace the default baseURI of the repository
     */
    replaceBaseURI(targetBaseURI: string, sourceBaseURI?: string) {
        let params: any = {
            targetBaseURI: new ARTURIResource(targetBaseURI)
        };
        if (sourceBaseURI != undefined) {
            params.sourceBaseURI = new ARTURIResource(sourceBaseURI);
        }
        return this.httpMgr.doPost(this.serviceName, "replaceBaseURI", params).pipe(
            map(() => {
                //if the project baseURI was replaced, update it
                if (sourceBaseURI == null || sourceBaseURI == VBContext.getWorkingProject().getBaseURI()) {
                    VBContext.getWorkingProject().setBaseURI(targetBaseURI);
                    this.vbProp.setActiveSchemes(VBContext.getWorkingProjectCtx(), []);
                    this.eventHandler.refreshDataBroadcastEvent.emit(null);
                }
            })
        );
    }

    migrateDefaultGraphToBaseURIGraph(clearDestinationGraph?: boolean) {
        let params: any = {};
        if (clearDestinationGraph != undefined) {
            params.clearDestinationGraph = clearDestinationGraph;
        }
        return this.httpMgr.doGet(this.serviceName, "migrateDefaultGraphToBaseURIGraph", params).pipe(
            map(() => {
                this.eventHandler.refreshDataBroadcastEvent.emit(null);
            })
        );
    }

    /**
     * @param xLabel the label to move to a new concept
     * @param conceptScheme scheme where new concept belongs
     * @param oldConcept concept that owned the xLabel (if null it is retrieved directly from label)
     * @param newConcept uri of the new concept to spawn (if null the uri will be randomically generated)
     * @param broaderConcept broader of the new created concept (if null the concept will be a top)
     * @param customFormValue custom form that set additional info to the concept
     */
    spawnNewConceptFromLabel(xLabel: ARTResource, conceptSchemes: ARTURIResource[], oldConcept?: ARTURIResource,
        newConcept?: ARTURIResource, broaderConcept?: ARTURIResource,
        customFormValue?: CustomFormValue) {

        let params: any = {
            xLabel: xLabel,
            conceptSchemes: conceptSchemes,
        };
        if (oldConcept != undefined) {
            params.oldConcept = oldConcept;
        }
        if (newConcept != undefined) {
            params.newConcept = newConcept;
        }
        if (broaderConcept != undefined) {
            params.broaderConcept = broaderConcept;
        }
        if (customFormValue != null) {
            params.customFormValue = customFormValue;
        }
        return this.httpMgr.doPost(this.serviceName, "spawnNewConceptFromLabel", params).pipe(
            map(stResp => {
                return Deserializer.createURI(stResp);
            })
        ).pipe(
            mergeMap(concept => {
                return this.resourceService.getResourceDescription(concept).pipe(
                    map(resource => {
                        resource.setAdditionalProperty(ResAttribute.NEW, true);
                        if (broaderConcept != null) { //created narrower
                            this.eventHandler.narrowerCreatedEvent.emit({ narrower: <ARTURIResource>resource, broader: broaderConcept });
                            return resource;
                        } else { //created topConcept
                            this.eventHandler.topConceptCreatedEvent.emit({ concept: <ARTURIResource>resource, schemes: conceptSchemes });
                            return { concept: <ARTURIResource>resource, schemes: conceptSchemes };
                        }
                    })
                );
            })
        );
    }

    /**
     * A refactoring service for moving xLabels to an existing concept
     * @param sourceResource 
     * @param predicate 
     * @param xLabel 
     * @param targetResource 
     * @param force set to true to create a new prefLabel for the targetResource even if this creates a conflict 
     * with another prefLabel belonging to a third resource
     */
    moveXLabelToResource(sourceResource: ARTResource, predicate: ARTURIResource, xLabel: ARTResource,
        targetResource: ARTResource, force?: boolean) {
        let params: any = {
            sourceResource: sourceResource,
            predicate: predicate,
            xLabel: xLabel,
            targetResource: targetResource
        };
        if (force != undefined) {
            params.force = force;
        }
        let options: VBRequestOptions = new VBRequestOptions({
            errorHandlers: [
                { className: 'it.uniroma2.art.semanticturkey.exceptions.PrefPrefLabelClashException', action: 'skip' },
            ]
        });
        return this.httpMgr.doPost(this.serviceName, "moveXLabelToResource", params, options);
    }

}