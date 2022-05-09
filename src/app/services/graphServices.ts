import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { ARTResource, ARTURIResource } from '../models/ARTResources';
import { GraphModelRecord } from '../models/Graphs';
import { HttpManager } from "../utils/HttpManager";
import { NTriplesUtil } from '../utils/ResourceUtils';
import { ResourcesServices } from './resourcesServices';

@Injectable()
export class GraphServices {

    private serviceName = "Graph";

    constructor(private httpMgr: HttpManager, private resourceService: ResourcesServices) { }

    getGraphModel(): Observable<GraphModelRecord[]> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getGraphModel", params).pipe(
            mergeMap((stResp) => {
                let plainModel: PlainGraphModelRecord[] = [];
                for (let record of stResp) {
                    plainModel.push(PlainGraphModelRecord.parse(record));
                }
                return this.enrichGraphModelRecords(plainModel);
            })
        );
    }

    expandGraphModelNode(resource: ARTURIResource): Observable<GraphModelRecord[]> {
        let params: any = {
            resource: resource
        };
        return this.httpMgr.doGet(this.serviceName, "expandGraphModelNode", params).pipe(
            mergeMap((stResp) => {
                let plainModel: PlainGraphModelRecord[] = [];
                for (let record of stResp) {
                    plainModel.push(PlainGraphModelRecord.parse(record));
                }
                return this.enrichGraphModelRecords(plainModel);
            })
        );
    }

    expandSubResources(resource: ARTURIResource): Observable<GraphModelRecord[]> {
        let params: any = {
            resource: resource,
            role: resource.getRole()
        };
        return this.httpMgr.doGet(this.serviceName, "expandSubResources", params).pipe(
            mergeMap((stResp) => {
                let plainModel: PlainGraphModelRecord[] = [];
                for (let record of stResp) {
                    plainModel.push(PlainGraphModelRecord.parse(record));
                }
                return this.enrichGraphModelRecords(plainModel);
            })
        );
    }

    expandSuperResources(resource: ARTURIResource): Observable<GraphModelRecord[]> {
        let params: any = {
            resource: resource,
            role: resource.getRole()
        };
        return this.httpMgr.doGet(this.serviceName, "expandSuperResources", params).pipe(
            mergeMap((stResp) => {
                let plainModel: PlainGraphModelRecord[] = [];
                for (let record of stResp) {
                    plainModel.push(PlainGraphModelRecord.parse(record));
                }
                return this.enrichGraphModelRecords(plainModel);
            })
        );
    }

    private enrichGraphModelRecords(plainModel: PlainGraphModelRecord[]): Observable<GraphModelRecord[]> {
        let unannotatedIRIs: ARTURIResource[] = [];
        plainModel.forEach(record => {
            if (record.source.isURIResource() && !unannotatedIRIs.some(iri => iri.equals(record.source))) { //if IRI and not yet in list
                unannotatedIRIs.push(<ARTURIResource>record.source);
            }
            if (!unannotatedIRIs.some(iri => iri.equals(record.link))) {
                unannotatedIRIs.push(record.link);
            }
            if (record.target.isURIResource() && !unannotatedIRIs.some(iri => iri.equals(record.target))) { //if IRI and not yet in list
                unannotatedIRIs.push(<ARTURIResource>record.target);
            }
        });

        if (unannotatedIRIs.length == 0) {
            return of([]);
        }

        return this.resourceService.getResourcesInfo(unannotatedIRIs).pipe(
            map((annotatedIRIs: ARTURIResource[]) => {
                let annotatedModel: GraphModelRecord[] = [];
                plainModel.forEach(record => {

                    let annotatedSource: ARTResource;
                    let annotatedLink: ARTURIResource;
                    let annotatedTarget: ARTResource;

                    if (record.source.isURIResource()) {
                        annotatedSource = annotatedIRIs.find(res => res.equals(record.source));
                    }
                    if (annotatedSource == null) { //not found or blank node
                        annotatedSource = record.source;
                    }

                    annotatedLink = annotatedIRIs.find(res => res.equals(record.link));
                    if (annotatedLink == null) { //not found
                        annotatedLink = record.link;
                    }

                    if (record.target.isURIResource()) {
                        annotatedTarget = annotatedIRIs.find(res => res.equals(record.target));
                    }
                    if (annotatedTarget == null) { //not found or blank node
                        annotatedTarget = record.target;
                    }

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

class PlainGraphModelRecord { //not annotated
    source: ARTResource;
    link: ARTURIResource;
    target: ARTResource;
    classAxiom: boolean;
    rangeDatatype: boolean;

    static parse(recordJson: any): PlainGraphModelRecord {
        return {
            source: NTriplesUtil.parseResource(recordJson.source),
            link: NTriplesUtil.parseURI(recordJson.link),
            target: NTriplesUtil.parseResource(recordJson.target),
            classAxiom: recordJson.classAxiom,
            rangeDatatype: recordJson.rangeDatatype
        };
    }
}