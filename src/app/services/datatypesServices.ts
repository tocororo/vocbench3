import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTURIResource, ResAttribute } from '../models/ARTResources';
import { Deserializer } from '../utils/Deserializer';
import { HttpManager } from "../utils/HttpManager";
import { VBEventHandler } from '../utils/VBEventHandler';
import { ResourcesServices } from './resourcesServices';

@Injectable()
export class DatatypesServices {

    private serviceName = "Datatypes";

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler, private resourceService: ResourcesServices) { }

    /**
     * 
     */
    getDatatypes(): Observable<ARTURIResource[]> {
        console.log("[DatatypesServices] getDatatypes");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getDatatypes", params).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * 
     */
    getOWL2DatatypeMap(): Observable<ARTURIResource[]> {
        console.log("[DatatypesServices] getOWL2DatatypeMap");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getOWL2DatatypeMap", params).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    getDeclaredDatatypes():  Observable<ARTURIResource[]> {
        console.log("[DatatypesServices] getDeclaredDatatypes");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getDeclaredDatatypes", params).map(
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
        console.log("[DatatypesServices] createDatatype");
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
        console.log("[DatatypesServices] deleteDatatype");
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