import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource, ResourcePosition } from "../models/ARTResources";
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
        let params: any = {
            subject: subject,
            property: property,
            value: value,
            newValue: newValue
        };
        return this.httpMgr.doPost(this.serviceName, "updateTriple", params).pipe(
            map(stResp => {
                if (property.getURI() == RDFS.subClassOf.getURI()) {
                    this.eventHandler.superClassUpdatedEvent.emit({ child: <ARTURIResource>subject, oldParent: <ARTURIResource>value, newParent: <ARTURIResource>newValue });
                } else if (property.getURI() == RDFS.subPropertyOf.getURI()) {
                    this.eventHandler.superPropertyUpdatedEvent.emit({ child: <ARTURIResource>subject, oldParent: <ARTURIResource>value, newParent: <ARTURIResource>newValue });
                } else if (property.getURI() == SKOS.broader.getURI()) {
                    this.eventHandler.broaderUpdatedEvent.emit({ child: <ARTURIResource>subject, oldParent: <ARTURIResource>value, newParent: <ARTURIResource>newValue });
                }
            })
        );
    }

    /**
     * 
     * @param subject 
     * @param property 
     * @param value 
     * @param newValue 
     */
    updateLexicalization(subject: ARTResource, property: ARTURIResource, value: ARTLiteral, newValue: ARTLiteral) {
        let params: any = {
            subject: subject,
            property: property,
            value: value,
            newValue: newValue
        };
        return this.httpMgr.doPost(this.serviceName, "updateLexicalization", params);
    }

    /**
     * 
     * @param property 
     * @param value 
     * @param newValue 
     */
    updatePredicateObject(property: ARTURIResource, value: ARTNode, newValue: ARTNode) {
        let params: any = {
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
        let params: any = {
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
        let params: any = {
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
        let params: any = {
            resource: resource,
        };
        return this.httpMgr.doPost(this.serviceName, "setDeprecated", params).pipe(
            map(stResp => {
                this.eventHandler.resourceDeprecatedEvent.emit(resource);
                return stResp;
            })
        );
    }

    /**
     * Add a value to a given subject-property pair
     * @param subject 
     * @param property 
     * @param value 
     */
    addValue(subject: ARTResource, property: ARTURIResource, value: ARTNode | CustomFormValue) {
        let params: any = {
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
        let params: any = {
            resource: resource
        };
        return this.httpMgr.doGet(this.serviceName, "getResourceDescription", params, options).pipe(
            map(stResp => {
                return Deserializer.createRDFResource(stResp);
            })
        );
    }

    /**
     * 
     * @param resource 
     * @param format 
     * @param options 
     */
    getOutgoingTriples(resource: ARTResource, format: string): Observable<string> {
        let params: any = {
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
        let params: any = {
            resource: resource,
            triples: triples,
            format: format
        };
        let options: VBRequestOptions = new VBRequestOptions({
            errorAlertOpt: { 
                show: true, 
                exceptionsToSkip: ['java.lang.IllegalArgumentException'] 
            } 
        });
        return this.httpMgr.doPost(this.serviceName, "updateResourceTriplesDescription", params, options);
    }

    /**
     * Returns the description of a set of resources
     * @param resources 
     */
    getResourcesInfo(resources: ARTResource[]): Observable<ARTResource[]> {
        let resourcesIri: string[] = resources.map(r => r.toNT());
        let params: any = {
            resources: JSON.stringify(resourcesIri)
        };
        return this.httpMgr.doPost(this.serviceName, "getResourcesInfo", params).pipe(
            map(stResp => {
                return Deserializer.createResourceArray(stResp);
            })
        );
    }

    /**
     * Returns the position (local/remote/unknown) of the given resource
     * @param resource
     */
    getResourcePosition(resource: ARTURIResource): Observable<ResourcePosition> {
        let params: any = {
            resource: resource
        };
        return this.httpMgr.doGet(this.serviceName, "getResourcePosition", params).pipe(
            map(stResp => {
                return ResourcePosition.deserialize(stResp);
            })
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
        return this.httpMgr.doPost(this.serviceName, "getResourcesPosition", params).pipe(
            map(stResp => {
                let map: { [key: string]: ResourcePosition } = {};
                for (let res in stResp) {
                    map[res] = ResourcePosition.deserialize(stResp[res].position);
                }
                return map;
            })
        );
    }

}