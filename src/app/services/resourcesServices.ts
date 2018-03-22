import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { VBEventHandler } from '../utils/VBEventHandler';
import { ARTResource, ARTURIResource, ARTNode } from "../models/ARTResources";
import { CustomFormValue } from "../models/CustomForms";
import { RDFS, SKOS } from '../models/Vocabulary';

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
        console.log("[ResourcesServices] updateTriple");
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
        console.log("[ResourcesServices] removeValue");
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
        console.log("[ResourcesServices] setDeprecated");
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
        console.log("[ResourcesServices] addValue");
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
        console.log("[ResourcesServices] getResourceDescription");
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
        console.log("[ResourcesServices] getResourcesInfo");
        var params: any = {
            resources: resources
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
    getResourcePosition(resource: ARTURIResource): Observable<string> {
        console.log("[ResourcesServices] getResourcePosition");
        var params: any = {
            resource: resource
        };
        return this.httpMgr.doGet(this.serviceName, "getResourcePosition", params);
    }

}