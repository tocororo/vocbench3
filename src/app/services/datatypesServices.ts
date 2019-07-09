import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTURIResource, ResAttribute } from '../models/ARTResources';
import { Deserializer } from '../utils/Deserializer';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { VBEventHandler } from '../utils/VBEventHandler';
import { ResourcesServices } from './resourcesServices';

@Injectable()
export class DatatypesServices {

    private serviceName = "Datatypes";

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler, private resourceService: ResourcesServices) { }

    /**
     * 
     */
    getDatatypes(options?: VBRequestOptions): Observable<ARTURIResource[]> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getDatatypes", params, options).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * 
     */
    getOWL2DatatypeMap(options?: VBRequestOptions): Observable<ARTURIResource[]> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getOWL2DatatypeMap", params, options).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    getDeclaredDatatypes(options?: VBRequestOptions):  Observable<ARTURIResource[]> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getDeclaredDatatypes", params, options).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * 
     * @param newDatatype 
     */
    createDatatype(newDatatype: ARTURIResource): Observable<ARTURIResource> {
        var params: any = {
            newDatatype: newDatatype
        };
        return this.httpMgr.doPost(this.serviceName, "createDatatype", params).map(
            stResp => {
                return Deserializer.createURI(stResp);
            }
        ).flatMap(
            datatype => {
                return this.resourceService.getResourceDescription(datatype).map(
                    resource => {
                        resource.setAdditionalProperty(ResAttribute.NEW, true);
                        this.eventHandler.datatypeCreatedEvent.emit(<ARTURIResource>resource);
                        return <ARTURIResource>resource;
                    }
                );
            }
        );
    }

    /**
     * 
     * @param datatype 
     */
    deleteDatatype(datatype: ARTURIResource) {
        var params: any = {
            datatype: datatype
        };
        return this.httpMgr.doPost(this.serviceName, "deleteDatatype", params).map(
            stResp => {
                this.eventHandler.datatypeDeletedEvent.emit(datatype);
                return stResp;
            }
        );
    }

    
}