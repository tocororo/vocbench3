import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTBNode, ARTURIResource, ResAttribute } from '../models/ARTResources';
import { ConstrainingFacets, DatatypeRestrictionDescription, DatatypeRestrictionsMap } from '../models/Datatypes';
import { OWL, XmlSchema } from '../models/Vocabulary';
import { Deserializer } from '../utils/Deserializer';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { ResourceUtils } from '../utils/ResourceUtils';
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

    getDeclaredDatatypes(options?: VBRequestOptions): Observable<ARTURIResource[]> {
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

    getDatatypeRestrictions(): Observable<DatatypeRestrictionsMap> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getDatatypeRestrictions", params).map(
            stResp => {
                let dtRestrMap: DatatypeRestrictionsMap = new Map();
                for (let dt in stResp) {
                    let constraintFacets: ConstrainingFacets = {};
                    for (let facet in stResp[dt]) {
                        let restrValue: string = ResourceUtils.parseLiteral(stResp[dt][facet]).getValue();
                        if (facet == XmlSchema.maxExclusive.getURI()) {
                            constraintFacets.maxExclusive = parseInt(restrValue);
                        } else if (facet == XmlSchema.maxInclusive.getURI()) {
                            constraintFacets.maxInclusive = parseInt(restrValue);
                        } else if (facet == XmlSchema.minExclusive.getURI()) {
                            constraintFacets.minExclusive = parseInt(restrValue);
                        } else if (facet == XmlSchema.minInclusive.getURI()) {
                            constraintFacets.minInclusive = parseInt(restrValue);
                        } else if (facet == XmlSchema.pattern.getURI()) {
                            constraintFacets.pattern = restrValue;
                        }
                    }
                    dtRestrMap.set(dt, constraintFacets);
                }
                return dtRestrMap;
            }
        );
    }

    getRestrictionDescription(restriction: ARTBNode): Observable<DatatypeRestrictionDescription> {
        var params: any = {
            restriction: restriction
        };
        return this.httpMgr.doGet(this.serviceName, "getRestrictionDescription", params).map(
            stResp => {
                let description: DatatypeRestrictionDescription = new DatatypeRestrictionDescription();
                for (let key in stResp) {
                    let value: string = stResp[key];
                    /**
                     * the initial + for the min/max facets is used for converting a string to number (independently if int or float)
                     * see https://stackoverflow.com/a/14668510/5805661
                     */
                    if (key == OWL.onDatatype.getURI()) {
                        description.base = ResourceUtils.parseURI(value);
                    } else if (key == XmlSchema.maxExclusive.getURI()) {
                        description.facets.maxExclusive = +ResourceUtils.parseLiteral(value).getValue(); 
                    } else if (key == XmlSchema.maxInclusive.getURI()) {
                        description.facets.maxInclusive = +ResourceUtils.parseLiteral(value).getValue(); 
                    } else if (key == XmlSchema.minExclusive.getURI()) {
                        description.facets.minExclusive = +ResourceUtils.parseLiteral(value).getValue();
                    } else if (key == XmlSchema.minInclusive.getURI()) {
                        description.facets.minInclusive = +ResourceUtils.parseLiteral(value).getValue();
                    } else if (key == XmlSchema.pattern.getURI()) {
                        description.facets.pattern = ResourceUtils.parseLiteral(value).getValue();
                    }
                }
                return description;
            }
        );
    }

    setDatatypeRestriction(datatype: ARTURIResource, base: ARTURIResource, facets: { [facet: string]: string }) {
        var params: any = {
            datatype: datatype,
            base: base,
            facets: JSON.stringify(facets),
        };
        return this.httpMgr.doPost(this.serviceName, "setDatatypeRestriction", params);
    }

    deleteDatatypeRestriction(datatype: ARTURIResource) {
        var params: any = {
            datatype: datatype,
        };
        return this.httpMgr.doPost(this.serviceName, "deleteDatatypeRestriction", params);
    }


}