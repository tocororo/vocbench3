import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Correspondence } from '../models/Alignment';
import { ARTBNode, ARTResource, ARTURIResource } from '../models/ARTResources';
import { Deserializer } from '../utils/Deserializer';
import { HttpManager } from "../utils/HttpManager";

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
        return this.httpMgr.doGet(this.serviceName, "getCorrespondences", params).map(
            stResp => {
                let correspondences: Correspondence[] = [];
                for (let i = 0; i < stResp.length; i++) {
                    let c: Correspondence = {
                        identity: new ARTBNode(stResp[i].identity),
                        leftEntity: Deserializer.createRDFNodeArray(stResp[i].leftEntity),
                        rightEntity: Deserializer.createRDFNodeArray(stResp[i].rightEntity),
                        measure: Deserializer.createRDFNodeArray(stResp[i].measure),
                        relation: Deserializer.createRDFNodeArray(stResp[i].relation)
                    }
                    correspondences.push(c);
                }
                return correspondences;
            }
        );
    }

}