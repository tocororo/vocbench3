import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {VBEventHandler} from "../utils/VBEventHandler";
import {ARTURIResource} from "../models/ARTResources";

@Injectable()
export class RefactorServices {

    private serviceName = "Refactor";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    /**
     * Refactors SKOS data (labels and notes) into SKOSXL
     */
    SKOStoSKOSXL() {
        console.log("[RefactorServices] SKOStoSKOSXL");
        var params: any = {};
        return this.httpMgr.doGet("Refactor2", "SKOStoSKOSXL", params, this.oldTypeService, true).map(
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
        return this.httpMgr.doGet("Refactor2", "SKOSXLtoSKOS", params, this.oldTypeService, true).map(
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
    changeResourceURI(oldResource: ARTURIResource, newResource: string) {
        console.log("[RefactorServices] changeResourceURI");
        var params: any = {
            oldResource : oldResource.getURI(),
            newResource : newResource
        };
        return this.httpMgr.doGet(this.serviceName, "changeResourceURI", params, this.oldTypeService).map(
            stResp => {
                var newResElem = stResp.getElementsByTagName("newResource")[0];
                var newResource = Deserializer.createURI(newResElem);
                this.eventHandler.resourceRenamedEvent.emit({ oldResource: oldResource, newResource: newResource });
                return newResource;
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
            targetBaseURI : targetBaseURI
        }
        if (sourceBaseURI != undefined) {
            params.sourceBaseURI = sourceBaseURI;
        }
        return this.httpMgr.doGet(this.serviceName, "replaceBaseURI", params, this.oldTypeService).map(
            stResp => {
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
        return this.httpMgr.doGet(this.serviceName, "migrateDefaultGraphToBaseURIGraph", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.refreshDataBroadcastEvent.emit(null);
            }
        );
    }

}