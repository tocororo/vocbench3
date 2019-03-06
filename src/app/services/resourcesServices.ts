import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTNode, ARTResource, ARTURIResource, ResourcePosition } from "../models/ARTResources";
import { CustomFormValue } from "../models/CustomForms";
import { RDFS, SKOS } from '../models/Vocabulary';
import { Deserializer } from "../utils/Deserializer";
import { HttpManager } from "../utils/HttpManager";
import { VBEventHandler } from '../utils/VBEventHandler';

@Injectable()
export class ResourcesServices {

    private serviceName = "Resources";

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    /**
     * Updates the value of a triple replacing the old value with the new one
     * @param subject
     * @param property
     * @param value
     * @param newValue
     */
    updateTriple(subject: ARTResource, property: ARTURIResource, value: ARTNode, newValue: ARTNode) {
        var params: any = {
            subject: subject,
            property: property,
            value: value,
            newValue: newValue
        };
        return this.httpMgr.doPost(this.serviceName, "updateTriple", params).map(
            stResp => {
                if (property.getURI() == RDFS.subClassOf.getURI()) {
                    this.eventHandler.superClassUpdatedEvent.emit({child: <ARTURIResource>subject, oldParent: <ARTURIResource>value, newParent: <ARTURIResource>newValue});
                } else if (property.getURI() == RDFS.subPropertyOf.getURI()) {
                    this.eventHandler.superPropertyUpdatedEvent.emit({child: <ARTURIResource>subject, oldParent: <ARTURIResource>value, newParent: <ARTURIResource>newValue});
				} else if (property.getURI() == SKOS.broader.getURI()) {
                    this.eventHandler.broaderUpdatedEvent.emit({child: <ARTURIResource>subject, oldParent: <ARTURIResource>value, newParent: <ARTURIResource>newValue});
				}
            }
        );
    }

    /**
     * Remove a triple
     * @param resource
     * @param property
     * @param value
     */
    removeValue(subject: ARTResource, property: ARTURIResource, value: ARTNode) {
        var params: any = {
            subject: subject,
            property: property,
            value: value
        };
        return this.httpMgr.doPost(this.serviceName, "removeValue", params);
    }

    /**
     * Set a resource as deprecated
     * @param resource
     */
    setDeprecated(resource: ARTResource) {
        var params: any = {
            resource: resource,
        };
        return this.httpMgr.doPost(this.serviceName, "setDeprecated", params).map(
            stResp => {
                this.eventHandler.resourceDeprecatedEvent.emit(resource);
                return stResp;
            }
        );
    }

    /**
     * Add a value to a given subject-property pair
     * @param subject 
     * @param property 
     * @param value 
     */
    addValue(subject: ARTResource, property: ARTURIResource, value: ARTNode | CustomFormValue) {
        var params: any = {
            subject: subject,
            property: property,
            value: value
        };
        return this.httpMgr.doPost(this.serviceName, "addValue", params);
    }

    /**
     * Returns the description (nature show and qname) of the given resource
     * @param resource 
     */
    getResourceDescription(resource: ARTResource): Observable<ARTResource> {
        var params: any = {
            resource: resource
        };
        return this.httpMgr.doGet(this.serviceName, "getResourceDescription", params).map(
            stResp => {
                return Deserializer.createRDFResource(stResp);
            }
        );
    }

    /**
     * Returns the description of a set of resources
     * @param resources 
     */
    getResourcesInfo(resources: ARTURIResource[]): Observable<ARTURIResource[]> {
        let resourcesIri: string[] = resources.map(r => r.toNT());
        var params: any = {
            resources: JSON.stringify(resourcesIri)
        };
        return this.httpMgr.doPost(this.serviceName, "getResourcesInfo", params).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * Returns the position (local/remote/unknown) of the given resource
     * @param resource
     */
    getResourcePosition(resource: ARTURIResource): Observable<ResourcePosition> {
        var params: any = {
            resource: resource
        };
        return this.httpMgr.doGet(this.serviceName, "getResourcePosition", params).map(
            stResp => {
                return ResourcePosition.deserialize(stResp);
            }
        );
    }

}