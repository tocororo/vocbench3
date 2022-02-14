import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTResource, ARTURIResource } from '../models/ARTResources';
import { Reference } from '../models/Configuration';
import { Widget, WidgetAssociation, WidgetDataRecord, WidgetDataType, WidgetDefinition } from '../models/VisualizationWidgets';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class VisualizationWidgetsServices {

    private serviceName = "VisualizationWidgets";

    constructor(private httpMgr: HttpManager) { }

    getVisualizationData(resource: ARTResource, predicate: ARTURIResource): Observable<WidgetDataRecord[]> {
        let params = {
            resource: resource,
            predicate: predicate
        }
        return this.httpMgr.doGet(this.serviceName, "getVisualizationData", params).pipe(
            map(stResp => {
                let records: WidgetDataRecord[] = stResp.map((r: any) => WidgetDataRecord.parse(r));
                return records;
            })
        );
    }

    updateMapPoint(resource: ARTResource, predicate: ARTURIResource, location: ARTResource, latitude: number, longitude: number): Observable<void> {
        let params = {
            resource: resource,
            predicate: predicate,
            location: location,
            latitude: latitude,
            longitude: longitude,
        }
        return this.httpMgr.doPost(this.serviceName, "updateMapPoint", params);
    }

   
    createWidget(reference: string, definition: WidgetDefinition): Observable<void> {
        let params = {
            reference: reference,
            definition: JSON.stringify(definition)
        }
        return this.httpMgr.doPost(this.serviceName, "createWidget", params);
	}

    /**
     * 
     */
     getWidgetIdentifiers(): Observable<string[]> {
        let params = {}
        return this.httpMgr.doGet(this.serviceName, "getWidgetIdentifiers", params).pipe(
            map(refs => {
                return refs.sort();
            })
        );
    }

    /**
     * 
     * @param reference 
     */
    getWidget(reference: string): Observable<Widget> {
        let params = {
            reference: reference
        }
        return this.httpMgr.doGet(this.serviceName, "getWidget", params).pipe(
            map(stResp => {
                return <Widget>Widget.parse(stResp);
            })
        );
    }

    deleteWidget(reference: string) {
        let params = {
            reference: reference,
        }
        return this.httpMgr.doPost(this.serviceName, "deleteWidget", params);
    }


    /**
     * 
     */
     listAssociations(): Observable<WidgetAssociation[]> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "listAssociations", params).pipe(
            map(stResp => {
                let associations: WidgetAssociation[] = []
                stResp.forEach((a: { ref: string, trigger: string, widgetRef: string }) => {
                    associations.push({
                        ref: a.ref,
                        trigger: new ARTURIResource(a.trigger),
                        widget: {
                            reference: a.widgetRef,
                            name: Reference.getRelativeReferenceIdentifier(a.widgetRef),
                            scope: Reference.getRelativeReferenceScope(a.widgetRef)
                        }
                    })
                })
                associations.sort((a1: WidgetAssociation, a2: WidgetAssociation) => {
                    if (a1.trigger.equals(a2.trigger)) { //in case of same role, sort by pattern reference
                        return a1.widget.reference.localeCompare(a2.widget.reference);
                    } else {
                        return a1.trigger.getURI().localeCompare(a2.trigger.getURI());
                    }
                });
                return associations;
            })
        );
    }

    /**
     * 
     * @param role 
     * @param patternReference 
     */
    addAssociation(predicate: ARTURIResource, widgetRef: string) {
        let params = {
            predicate: predicate,
            widgetRef: widgetRef
        }
        return this.httpMgr.doPost(this.serviceName, "addAssociation", params);
    }

    /**
     * 
     * @param reference 
     */
    deleteAssociation(reference: string) {
        let params = {
            reference: reference,
        }
        return this.httpMgr.doPost(this.serviceName, "deleteAssociation", params);
    }


}