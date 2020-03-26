import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTNode, ARTResource, ARTURIResource, ResourcePosition } from "../models/ARTResources";
import { CustomFormValue } from "../models/CustomForms";
import { RDFS, SKOS } from '../models/Vocabulary';
import { Deserializer } from "../utils/Deserializer";
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
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
                    this.eventHandler.superClassUpdatedEvent.emit({ child: <ARTURIResource>subject, oldParent: <ARTURIResource>value, newParent: <ARTURIResource>newValue });
                } else if (property.getURI() == RDFS.subPropertyOf.getURI()) {
                    this.eventHandler.superPropertyUpdatedEvent.emit({ child: <ARTURIResource>subject, oldParent: <ARTURIResource>value, newParent: <ARTURIResource>newValue });
                } else if (property.getURI() == SKOS.broader.getURI()) {
                    this.eventHandler.broaderUpdatedEvent.emit({ child: <ARTURIResource>subject, oldParent: <ARTURIResource>value, newParent: <ARTURIResource>newValue });
                }
            }
        );
    }

    /**
     * 
     * @param property 
     * @param value 
     * @param newValue 
     */
    updatePredicateObject(property: ARTURIResource, value: ARTNode, newValue: ARTNode) {
        var params: any = {
            property: property,
            value: value,
            newValue: newValue
        };
        return this.httpMgr.doPost(this.serviceName, "updatePredicateObject", params);
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
     * 
     * @param property 
     * @param value 
     */
    removePredicateObject(property: ARTURIResource, value: ARTNode) {
        var params: any = {
            property: property,
            value: value,
        };
        return this.httpMgr.doPost(this.serviceName, "removePredicateObject", params);
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
    getResourceDescription(resource: ARTResource, options?: VBRequestOptions): Observable<ARTResource> {
        var params: any = {
            resource: resource
        };
        return this.httpMgr.doGet(this.serviceName, "getResourceDescription", params, options).map(
            stResp => {
                return Deserializer.createRDFResource(stResp);
            }
        );
    }

    /**
     * 
     * @param resource 
     * @param format 
     * @param options 
     */
    getOutgoingTriples(resource: ARTResource, format: string): Observable<string> {
        var params: any = {
            resource: resource,
            format: format
        };
        return this.httpMgr.doGet(this.serviceName, "getOutgoingTriples", params);
    }

    /**
     * 
     * @param resource 
     * @param triples 
     * @param format 
     */
    updateResourceTriplesDescription(resource: ARTResource, triples: string, format: string) {
        var params: any = {
            resource: resource,
            triples: triples,
            format: format
        };
        return this.httpMgr.doPost(this.serviceName, "updateResourceTriplesDescription", params);
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

    /**
     * Returns the position (local/remote/unknown) of the given resources
     * @param resource
     */
    getResourcesPosition(resources: ARTURIResource[]): Observable<{ [key: string]: ResourcePosition }> {
        let resourcesIri: string[] = resources.map(r => r.toNT());
        let params: any = {
            resources: JSON.stringify(resourcesIri)
        };
        return this.httpMgr.doPost(this.serviceName, "getResourcesPosition", params).map(
            stResp => {
                let map: { [key: string]: ResourcePosition } = {};
                for (let res in stResp) {
                    map[res] = ResourcePosition.deserialize(stResp[res].position);
                }
                return map;
            }
        );
    }

}