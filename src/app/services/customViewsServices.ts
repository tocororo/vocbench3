import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTNode, ARTResource, ARTURIResource } from '../models/ARTResources';
import { Reference } from '../models/Configuration';
import { CustomViewAssociation, CustomViewConfiguration, CustomViewData, CustomViewDefinition, CustomViewModel, ViewsEnum } from '../models/CustomViews';
import { HttpManager, STRequestParams } from "../utils/HttpManager";

@Injectable()
export class CustomViewsServices {

    private serviceName = "CustomViews";

    constructor(private httpMgr: HttpManager) { }

    /* ============== VIEWS ============== */

    /**
     * 
     */
    getViewsIdentifiers(): Observable<string[]> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getViewsIdentifiers", params).pipe(
            map(refs => {
                return refs.sort((r1: string, r2: string) => r1.localeCompare(r2));
            })
        );
    }

    /**
     * 
     * @param reference 
     */
    getCustomView(reference: string): Observable<CustomViewConfiguration> {
        let params = {
            reference: reference
        };
        return this.httpMgr.doGet(this.serviceName, "getCustomView", params).pipe(
            map(stResp => {
                return <CustomViewConfiguration>CustomViewConfiguration.parse(stResp);
            })
        );
    }

    createCustomView(reference: string, definition: CustomViewDefinition, model: CustomViewModel): Observable<void> {
        let params = {
            reference: reference,
            definition: JSON.stringify(definition),
            model: model
        };
        return this.httpMgr.doPost(this.serviceName, "createCustomView", params);
    }

    updateCustomView(reference: string, definition: CustomViewDefinition, model: CustomViewModel): Observable<void> {
        let params = {
            reference: reference,
            definition: JSON.stringify(definition),
            model: model
        };
        return this.httpMgr.doPost(this.serviceName, "updateCustomView", params);
    }

    deleteCustomView(reference: string) {
        let params = {
            reference: reference,
        };
        return this.httpMgr.doPost(this.serviceName, "deleteCustomView", params);
    }

    suggestDynamicVectorCVFromCustomForm(cfId: string): Observable<string> {
        let params = {
            cfId: cfId,
        };
        return this.httpMgr.doGet(this.serviceName, "suggestDynamicVectorCVFromCustomForm", params);
    }

    suggestAdvSingleValueCVFromCustomForm(cfId: string, chosenPh?: string): Observable<string> {
        let params = {
            cfId: cfId,
            chosenPh: chosenPh
        };
        return this.httpMgr.doGet(this.serviceName, "suggestAdvSingleValueCVFromCustomForm", params);
    }

    getValueCandidates(cfId: string): Observable<string[]> {
        let params = {
            cfId: cfId,
        };
        return this.httpMgr.doGet(this.serviceName, "getValueCandidates", params);
    }

    exportCustomView(reference: string) {
        let params = {
            reference: reference
        };
        return this.httpMgr.downloadFile(this.serviceName, "exportCustomView", params);
    }

    importCustomView(inputFile: File, reference: string) {
        let data: STRequestParams = {
            inputFile: inputFile,
            reference: reference,
        };
        return this.httpMgr.uploadFile(this.serviceName, "importCustomView", data);
    }


    /* ============== ASSOCIATIONS ============== */

    /**
    * 
    */
    listAssociations(): Observable<CustomViewAssociation[]> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "listAssociations", params).pipe(
            map(stResp => {
                let associations: CustomViewAssociation[] = [];
                stResp.forEach((a: { ref: string, property: string, customViewRef: string }) => {
                    associations.push({
                        ref: a.ref,
                        property: new ARTURIResource(a.property),
                        customViewRef: {
                            reference: a.customViewRef,
                            name: Reference.getRelativeReferenceIdentifier(a.customViewRef),
                            scope: Reference.getRelativeReferenceScope(a.customViewRef)
                        }
                    });
                });
                associations.sort((a1: CustomViewAssociation, a2: CustomViewAssociation) => {
                    if (a1.property.equals(a2.property)) { //in case of same prop, sort by reference
                        return a1.customViewRef.reference.localeCompare(a2.customViewRef.reference);
                    } else {
                        return a1.property.getURI().localeCompare(a2.property.getURI());
                    }
                });
                return associations;
            })
        );
    }

    /**
    * 
    * @param property 
    * @param customViewRef 
    */
    addAssociation(property: ARTURIResource, customViewRef: string, defaultView: ViewsEnum) {
        let params = {
            property: property,
            customViewRef: customViewRef,
            defaultView: defaultView
        };
        return this.httpMgr.doPost(this.serviceName, "addAssociation", params);
    }

    /**
     * 
     * @param reference 
     */
    deleteAssociation(reference: string) {
        let params = {
            reference: reference,
        };
        return this.httpMgr.doPost(this.serviceName, "deleteAssociation", params);
    }


    /* ============== DATA ============== */

    getViewData(resource: ARTResource, property: ARTURIResource): Observable<CustomViewData> {
        let params = {
            resource: resource,
            property: property
        };
        return this.httpMgr.doGet(this.serviceName, "getViewData", params).pipe(
            map(stResp => {
                return CustomViewData.parse(stResp);
            })
        );
    }

    updateSparqlBasedData(resource: ARTResource, property: ARTURIResource, bindings: Map<string, ARTNode>): Observable<void> {
        let params = {
            resource: resource,
            property: property,
            bindings: bindings
        };
        return this.httpMgr.doPost(this.serviceName, "updateSparqlBasedData", params);
    }

    updateSingleValueData(resource: ARTResource, property: ARTURIResource, oldValue: ARTNode, newValue: ARTNode, pivots?: Map<string, ARTNode>): Observable<void> {
        let params = {
            resource: resource,
            property: property,
            oldValue: oldValue,
            newValue: newValue,
            pivots: pivots
        };
        return this.httpMgr.doPost(this.serviceName, "updateSingleValueData", params);
    }

    updateStaticVectorData(resource: ARTResource, property: ARTURIResource, fieldProperty: ARTURIResource, oldValue: ARTNode, newValue: ARTNode) {
        let params = {
            resource: resource,
            property: property,
            fieldProperty: fieldProperty,
            oldValue: oldValue,
            newValue: newValue,
        };
        return this.httpMgr.doPost(this.serviceName, "updateStaticVectorData", params);
    }

    updateDynamicVectorData(resource: ARTResource, property: ARTURIResource, fieldName: string, oldValue: ARTNode, newValue: ARTNode, pivots: Map<string, ARTNode>) {
        let params = {
            resource: resource,
            property: property,
            fieldName: fieldName,
            oldValue: oldValue,
            newValue: newValue,
            pivots: pivots
        };
        return this.httpMgr.doPost(this.serviceName, "updateDynamicVectorData", params);
    }


}