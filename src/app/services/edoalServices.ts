import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Correspondence } from '../models/Alignment';
import { ARTBNode, ARTResource, ARTURIResource } from '../models/ARTResources';
import { Deserializer } from '../utils/Deserializer';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";

@Injectable()
export class EdoalServices {

    private serviceName = "EDOAL";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Pair of projects' names
     */
    getAlignedProjects(): Observable<string[]> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getAlignedProjects", params);
    }

    /**
     * Returns the align:Alignment resources defined in the current project
     */
    getAlignments(): Observable<ARTResource[]> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getAlignments", params).map(
            stResp => {
                return Deserializer.createResourceArray(stResp, ['correspondences']);
            }
        );
    }

    /**
     * Adds a new correspondence (i.e. an align:cell) to the provided alignment.
     * @param alignment 
     * @param leftEntity 
     * @param rightEntity 
     * @param relation 
     * @param measure 
     */
    createCorrespondence(alignment: ARTResource, leftEntity: ARTURIResource, rightEntity: ARTURIResource, relation: string, measure: number): Observable<void> {
        var params: any = {
            alignment: alignment,
            leftEntity: leftEntity,
            rightEntity: rightEntity,
            relation: relation,
            measure: measure
        };
        return this.httpMgr.doPost(this.serviceName, "createCorrespondence", params);
    }

    /**
     * Sets the align:entity1 of the provided correspondence.
     * @param correspondence 
     * @param entity 
     */
    setLeftEntity(correspondence: ARTResource, entity: ARTURIResource): Observable<void> {
        var params: any = {
            correspondence: correspondence,
            entity: entity
        };
        return this.httpMgr.doPost(this.serviceName, "setLeftEntity", params);
    }

    /**
     * Sets the align:entity2 of the provided correspondence.
     * @param correspondence 
     * @param entity 
     */
    setRightEntity(correspondence: ARTResource, entity: ARTURIResource): Observable<void> {
        var params: any = {
            correspondence: correspondence,
            entity: entity
        };
        return this.httpMgr.doPost(this.serviceName, "setRightEntity", params);
    }

    /**
     * Sets the align:relation of the provided correspondence.
     * @param correspondence 
     * @param relation 
     */
    setRelation(correspondence: ARTResource, relation: string): Observable<void> {
        var params: any = {
            correspondence: correspondence,
            relation: relation
        };
        return this.httpMgr.doPost(this.serviceName, "setRelation", params);
    }

    /**
     * Sets the align:measure of the provided correspondence.
     * @param correspondence 
     * @param measure 
     */
    setMeasure(correspondence: ARTResource, measure: number): Observable<void> {
        var params: any = {
            correspondence: correspondence,
            measure: measure
        };
        return this.httpMgr.doPost(this.serviceName, "setMeasure", params);
    }

    /**
     * Sets the align:mappingProperty of the provided correspondece
     * @param correspondence 
     * @param property 
     */
    setMappingProperty(correspondence: ARTResource, property: ARTURIResource): Observable<void> {
        var params: any = {
            correspondence: correspondence,
            property: property
        };
        return this.httpMgr.doPost(this.serviceName, "setMappingProperty", params);
    }

    /**
     * Deletes the provided correspondence.
     * @param correspondence 
     */
    deleteCorrespondence(correspondence: ARTResource): Observable<void> {
        var params: any = {
            correspondence: correspondence,
        };
        return this.httpMgr.doPost(this.serviceName, "deleteCorrespondence", params);
    }

    /**
     * 
     * @param alignment 
     * @param page 
     * @param pageSize 
     */
    getCorrespondences(alignment: ARTResource, page?: number, pageSize?: number): Observable<Correspondence[]> {
        var params: any = {
            alignment: alignment,
            page: page,
            pageSize: pageSize
        };
        let options: VBRequestOptions = new VBRequestOptions({
            errorAlertOpt: { 
                show: true, 
                exceptionsToSkip: [ 'it.uniroma2.art.semanticturkey.services.core.IndexingLanguageNotFound']
            } 
        });
        return this.httpMgr.doGet(this.serviceName, "getCorrespondences", params, options).map(
            stResp => {
                let correspondences: Correspondence[] = [];
                stResp.forEach((corrJson: any) => {
                    let c: Correspondence = {
                        identity: new ARTBNode(corrJson.identity),
                        leftEntity: Deserializer.createURIArray(corrJson.leftEntity),
                        rightEntity: Deserializer.createURIArray(corrJson.rightEntity),
                        measure: Deserializer.createRDFNodeArray(corrJson.measure),
                        relation: Deserializer.createRDFNodeArray(corrJson.relation),
                        mappingProperty: Deserializer.createURIArray(corrJson.mappingProperty)
                    }
                    correspondences.push(c);
                })
                return correspondences;
            }
        );
    }

    createAlignment(): Observable<ARTBNode> {
        let params: any = {}
        return this.httpMgr.doPost(this.serviceName, "createAlignment", params).map(
            stResp => {
                return Deserializer.createBlankNode(stResp);
            }
        );
    }

}