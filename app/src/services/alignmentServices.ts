import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";
import {ARTURIResource} from "../utils/ARTResources";
import {Deserializer} from "../utils/Deserializer";

@Injectable()
export class AlignmentServices {

    private serviceName = "Alignment";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the available alignment properties depending on the project and resource type (property,
	 * or concept, or class,...).
	 * @param resource resource to align
	 * @param allMappingProps if false returns just the mapping properties available for the current
	 * model type; if true returns all the mapping properties independently from the model type
	 * @return a collection of properties
     */
    getMappingRelations(resource: ARTURIResource, allMappingProps: boolean) {
        console.log("[AlignmentServices] getMappingRelations");
        var params: any = {
            resource: resource.getURI(),
            allMappingProps: allMappingProps
        };
        return this.httpMgr.doGet(this.serviceName, "getMappingRelations", params, this.oldTypeService).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }
    
    /**
     * Adds an alignment between a local sourceResource and a targetResource chosen from an external project in ST.
     * At low level, this service simply adds the triple sourceResource predicate targetResource
     * @param sourceResource the resource (local to the project) to align 
     * @param predicate the mapping predicate
     * @param targetResource the resource (of an external project) to align
     */
    addAlignment(sourceResource: ARTURIResource, predicate: ARTURIResource, targetResource: ARTURIResource) {
        console.log("[AlignmentServices] addAlignment");
        var params: any = {
            sourceResource: sourceResource.getURI(),
            predicate: predicate.getURI(),
            targetResource: targetResource.getURI()
        };
        return this.httpMgr.doGet(this.serviceName, "addAlignment", params, this.oldTypeService);
    }
    
}