import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { ARTURIResource } from '../models/ARTResources';
import { GraphModelRecord } from '../models/Graphs';
import { HttpManager } from "../utils/HttpManager";
import { ResourcesServices } from './resourcesServices';

@Injectable()
export class GraphServices {

    private serviceName = "Graph";

    constructor(private httpMgr: HttpManager, private resourceService: ResourcesServices) { }

    getGraphModel(): Observable<GraphModelRecord[]> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getGraphModel", params).pipe(
            mergeMap((plainModel: PlainGraphModelRecord[]) => {
                return this.enrichGraphModelRecords(plainModel);
            })
        )
    }

    expandGraphModelNode(resource: ARTURIResource): Observable<GraphModelRecord[]> {
        var params: any = {
            resource: resource
        };
        return this.httpMgr.doGet(this.serviceName, "expandGraphModelNode", params).pipe(
            mergeMap((plainModel: PlainGraphModelRecord[]) => {
                return this.enrichGraphModelRecords(plainModel);
            })
        );
    }

    expandSubResources(resource: ARTURIResource): Observable<GraphModelRecord[]> {
        var params: any = {
            resource: resource,
            role: resource.getRole()
        };
        return this.httpMgr.doGet(this.serviceName, "expandSubResources", params).pipe(
            mergeMap((plainModel: PlainGraphModelRecord[]) => {
                return this.enrichGraphModelRecords(plainModel);
            })
        );
    }

    expandSuperResources(resource: ARTURIResource): Observable<GraphModelRecord[]> {
        var params: any = {
            resource: resource,
            role: resource.getRole()
        };
        return this.httpMgr.doGet(this.serviceName, "expandSuperResources", params).pipe(
            mergeMap((plainModel: PlainGraphModelRecord[]) => {
                return this.enrichGraphModelRecords(plainModel);
            })
        );
    }

    private enrichGraphModelRecords(plainModel: PlainGraphModelRecord[]): Observable<GraphModelRecord[]> {
        let resURIs: string[] = [];
        //collecting IRIs
        plainModel.forEach(record => {
            if (resURIs.indexOf(record.source) == -1) {
                resURIs.push(record.source);
            }
            if (resURIs.indexOf(record.link) == -1) {
                resURIs.push(record.link);
            }
            if (resURIs.indexOf(record.target) == -1) {
                resURIs.push(record.target);
            }
        });

        let unannotatedIRIs: ARTURIResource[] = [];
        resURIs.forEach(i => {
            unannotatedIRIs.push(new ARTURIResource(i));
        });

        if (unannotatedIRIs.length == 0) {
            return of([]);
        }

        return this.resourceService.getResourcesInfo(unannotatedIRIs).pipe(
            map((annotatedIRIs: ARTURIResource[]) => {
                let annotatedModel: GraphModelRecord[] = [];
                plainModel.forEach(record => {
                    let annotatedSource: ARTURIResource = annotatedIRIs.find(res => res.getURI() == record.source);
                    let annotatedLink: ARTURIResource = annotatedIRIs.find(res => res.getURI() == record.link);
                    let annotatedTarget: ARTURIResource = annotatedIRIs.find(res => res.getURI() == record.target);
                    if (record.rangeDatatype) {
                        annotatedTarget.setAdditionalProperty("isDatatype", true);
                    }
                    annotatedModel.push({
                        source: annotatedSource,
                        link: annotatedLink,
                        target: annotatedTarget,
                        classAxiom: record.classAxiom,
                    });
                });
                return annotatedModel;
            })
        );
    }

}

class PlainGraphModelRecord {
    source: string;
    link: string;
    target: string;
    classAxiom: boolean;
    rangeDatatype: boolean;
}