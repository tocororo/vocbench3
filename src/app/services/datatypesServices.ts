import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { ARTBNode, ARTLiteral, ARTURIResource, ResAttribute } from '../models/ARTResources';
import { DatatypeRestrictionDescription, DatatypeRestrictionsMap, FacetsRestriction } from '../models/Datatypes';
import { OWL, XmlSchema } from '../models/Vocabulary';
import { Deserializer } from '../utils/Deserializer';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { NTriplesUtil } from '../utils/ResourceUtils';
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
        return this.httpMgr.doGet(this.serviceName, "getDatatypes", params, options).pipe(
            map(stResp => {
                return Deserializer.createURIArray(stResp);
            })
        );
    }

    /**
     * 
     */
    getOWL2DatatypeMap(options?: VBRequestOptions): Observable<ARTURIResource[]> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getOWL2DatatypeMap", params, options).pipe(
            map(stResp => {
                return Deserializer.createURIArray(stResp);
            })
        );
    }

    getDeclaredDatatypes(options?: VBRequestOptions): Observable<ARTURIResource[]> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getDeclaredDatatypes", params, options).pipe(
            map(stResp => {
                return Deserializer.createURIArray(stResp);
            })
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
        return this.httpMgr.doPost(this.serviceName, "createDatatype", params).pipe(
            map(stResp => {
                return Deserializer.createURI(stResp);
            })
        ).pipe(
            mergeMap(datatype => {
                return this.resourceService.getResourceDescription(datatype).pipe(
                    map(resource => {
                        resource.setAdditionalProperty(ResAttribute.NEW, true);
                        this.eventHandler.datatypeCreatedEvent.emit(<ARTURIResource>resource);
                        return <ARTURIResource>resource;
                    })
                );
            })
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
        return this.httpMgr.doPost(this.serviceName, "deleteDatatype", params).pipe(
            map(stResp => {
                this.eventHandler.datatypeDeletedEvent.emit(datatype);
                return stResp;
            })
        );
    }

    getDatatypeRestrictions(): Observable<DatatypeRestrictionsMap> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getDatatypeRestrictions", params).pipe(
            map(stResp => {
                let dtRestrMap: DatatypeRestrictionsMap = new Map();
                for (let dt in stResp) {
                    dtRestrMap.set(dt, this.parseDatatypeRestrictionDescription(stResp[dt]));
                }
                return dtRestrMap;
            })
        );
    }

    getRestrictionDescription(restriction: ARTBNode): Observable<DatatypeRestrictionDescription> {
        var params: any = {
            restriction: restriction
        };
        return this.httpMgr.doGet(this.serviceName, "getRestrictionDescription", params).pipe(
            map(stResp => {
                return this.parseDatatypeRestrictionDescription(stResp);
            })
        );
    }

    setDatatypeFacetsRestriction(datatype: ARTURIResource, base: ARTURIResource, facets: { [facet: string]: string }) {
        var params: any = {
            datatype: datatype,
            base: base,
            facets: JSON.stringify(facets),
        };
        return this.httpMgr.doPost(this.serviceName, "setDatatypeFacetsRestriction", params);
    }

    setDatatypeManchesterRestriction(datatype: ARTURIResource, manchExpr: string) {
        var params: any = {
            datatype: datatype,
            manchExpr: manchExpr,
        };
        return this.httpMgr.doPost(this.serviceName, "setDatatypeManchesterRestriction", params);
    }

    setDatatypeEnumerationRestrictions(datatype: ARTURIResource, literals: ARTLiteral[]) {
        var params: any = {
            datatype: datatype,
            literals: literals,
        };
        return this.httpMgr.doPost(this.serviceName, "setDatatypeEnumerationRestrictions", params);
    }


    deleteDatatypeRestriction(datatype: ARTURIResource) {
        var params: any = {
            datatype: datatype,
        };
        return this.httpMgr.doPost(this.serviceName, "deleteDatatypeRestriction", params);
    }

    private parseDatatypeRestrictionDescription(descriptionJson: any): DatatypeRestrictionDescription {
        let description: DatatypeRestrictionDescription = new DatatypeRestrictionDescription();
        let facetsJson = descriptionJson.facets;
        let enumerationsJson = descriptionJson.enumerations;
        if (Object.keys(facetsJson).length != 0) { //facetsJson not empty?
            let facetsDescription: FacetsRestriction = new FacetsRestriction();
            for (let key in facetsJson) {
                let value: string = facetsJson[key];
                /**
                 * the initial + for the min/max facets is used for converting a string to number (independently if int or float)
                 * see https://stackoverflow.com/a/14668510/5805661
                 */
                if (key == OWL.onDatatype.getURI()) {
                    facetsDescription.base = NTriplesUtil.parseURI(value);
                } else if (key == XmlSchema.maxExclusive.getURI()) {
                    facetsDescription.facets.maxExclusive = +NTriplesUtil.parseLiteral(value).getValue(); 
                } else if (key == XmlSchema.maxInclusive.getURI()) {
                    facetsDescription.facets.maxInclusive = +NTriplesUtil.parseLiteral(value).getValue(); 
                } else if (key == XmlSchema.minExclusive.getURI()) {
                    facetsDescription.facets.minExclusive = +NTriplesUtil.parseLiteral(value).getValue();
                } else if (key == XmlSchema.minInclusive.getURI()) {
                    facetsDescription.facets.minInclusive = +NTriplesUtil.parseLiteral(value).getValue();
                } else if (key == XmlSchema.pattern.getURI()) {
                    facetsDescription.facets.pattern = NTriplesUtil.parseLiteral(value).getValue();
                }
            }
            description.facets = facetsDescription;
        } else if (enumerationsJson.lenght != 0) { //enumeration array not empty?
            description.enumerations = Deserializer.createLiteralArray(enumerationsJson);
        }
        return description;
    }

}