import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { VBEventHandler } from "../utils/VBEventHandler";
import { ARTResource, ARTURIResource } from "../models/ARTResources";

@Injectable()
export class IndividualsServices {

    private serviceName = "Individuals";

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    /**
     * Returns the (explicit) named types of the given individual
     * @param individual
     */
    getNamedTypes(individual: ARTResource): Observable<ARTURIResource[]> {
        console.log("[IndividualsServices] getNamedTypes");
        var params: any = {
            individual: individual
        };
        return this.httpMgr.doGet(this.serviceName, "getNamedTypes", params, true).map(
            stResp => {
                var types = Deserializer.createURIArray(stResp);
                return types;
            }
        );
    }

    /**
     * Adds a type to a resource. Emits a typeDeletedEvent with resource and type
     * @param individual the resource to which add a type
     * @param type the type to add to the individual
     */
    addType(individual: ARTResource, type: ARTResource) {
        console.log("[IndividualsServices] addType");
        var params: any = {
            individual: individual,
            type: type,
        };
        return this.httpMgr.doGet(this.serviceName, "addType", params, true).map(
            stResp => {
                this.eventHandler.typeAddedEvent.emit({ resource: individual, type: type });
                return stResp;
            }
        );
    }

    /**
     * Removes the type of a resource. Emits a typeDeletedEvent with resource (the resource to which the type is removed)
     * and type (the removed type)
     * @param individual the resource whose the type need to be removed
     * @param type type to remove 
     */
    removeType(individual: ARTURIResource, type: ARTResource) {
        console.log("[IndividualsServices] removeType");
        var params: any = {
            individual: individual,
            type: type,
        };
        return this.httpMgr.doGet(this.serviceName, "removeType", params, true).map(
            stResp => {
                this.eventHandler.typeRemovedEvent.emit({ resource: individual, type: type });
                return stResp;
            }
        );
    }

}