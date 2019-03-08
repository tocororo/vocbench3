import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTURIResource } from '../models/ARTResources';
import { GraphModelRecord } from '../models/Graphs';
import { HttpManager } from "../utils/HttpManager";
import { ResourcesServices } from './resourcesServices';
import { ResourceUtils } from '../utils/ResourceUtils';

@Injectable()
export class GraphServices {

    private serviceName = "Graph";

    constructor(private httpMgr: HttpManager, private resourceService: ResourcesServices) { }

    getGraphModel(): Observable<GraphModelRecord[]> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getGraphModel", params).flatMap(
            (plainModel: PlainGraphModelRecord[]) => {
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

                return this.resourceService.getResourcesInfo(unannotatedIRIs).map(
                    (annotatedIRIs: ARTURIResource[]) => {
                        let annotatedModel: GraphModelRecord[] = [];
                        plainModel.forEach(record => {
                            annotatedModel.push({
                                source: annotatedIRIs[ResourceUtils.indexOfNode(annotatedIRIs, new ARTURIResource(record.source))],
                                link: annotatedIRIs[ResourceUtils.indexOfNode(annotatedIRIs, new ARTURIResource(record.link))],
                                target: annotatedIRIs[ResourceUtils.indexOfNode(annotatedIRIs, new ARTURIResource(record.target))],
                                classAxiom: record.classAxiom
                            });
                        });
                        return annotatedModel;
                    }
                );

            }
        )
    }

}

class PlainGraphModelRecord {
    source: string;
    link: string;
    target: string;
    classAxiom: boolean;
}