import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from "@angular/core";
import { ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource } from "../../models/ARTResources";
import { ResViewPartition } from "../../models/ResourceView";
import { ResourceViewServices } from "../../services/resourceViewServices";
import { Deserializer } from "../../utils/Deserializer";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { AbstractGraph, GraphMode } from "../abstractGraph";
import { D3Service } from "../d3/d3Services";
import { GraphModalServices } from "../modal/graphModalServices";
import { DataNode } from "../model/DataNode";
import { Link } from "../model/Link";
import { Node } from "../model/Node";

@Component({
    selector: 'data-graph',
    templateUrl: "./dataGraphComponent.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../graph.css']
})
export class DataGraphComponent extends AbstractGraph {

    protected mode = GraphMode.dataOriented;

    private linkLimit: number = 50;

    private rvPartitions: ResViewPartition[] = [
        ResViewPartition.broaders, ResViewPartition.classaxioms, ResViewPartition.constituents, ResViewPartition.denotations,
        ResViewPartition.disjointProperties, ResViewPartition.domains, ResViewPartition.equivalentProperties, 
        ResViewPartition.evokedLexicalConcepts, ResViewPartition.facets, ResViewPartition.formBasedPreview,
        ResViewPartition.formRepresentations, ResViewPartition.imports, ResViewPartition.labelRelations, ResViewPartition.lexicalForms,
        ResViewPartition.lexicalSenses, ResViewPartition.lexicalizations, ResViewPartition.members, ResViewPartition.membersOrdered,
        ResViewPartition.notes, ResViewPartition.properties, ResViewPartition.ranges, ResViewPartition.rdfsMembers, ResViewPartition.schemes,
        ResViewPartition.subPropertyChains, ResViewPartition.subterms, ResViewPartition.superproperties, ResViewPartition.topconceptof,
        ResViewPartition.types
    ]

    constructor(protected d3Service: D3Service, protected elementRef: ElementRef, protected ref: ChangeDetectorRef,
        private resViewService: ResourceViewServices, private graphModals: GraphModalServices) {
        super(d3Service, elementRef, ref);
    }

    protected expandNode(node: Node) {
        if (!node.res.isResource()) {
            return;
        }

        this.resViewService.getResourceView(<ARTResource>node.res).subscribe(
            rv => {
                let predObjListMap: { [partition: string]: ARTPredicateObjects[] } = {};
                this.rvPartitions.forEach(partition => {
                    let partitionJson = rv[partition];
                    if (partition == ResViewPartition.facets && partitionJson != null) {
                        partitionJson = partitionJson.inverseOf;
                    }
                    if (partitionJson != null) {
                        let poList: ARTPredicateObjects[] = Deserializer.createPredicateObjectsList(partitionJson);
                        predObjListMap[partition] = poList;
                    }
                });
                //count number of objects
                let linkCount: number = 0;
                for (let partition in predObjListMap) {
                    predObjListMap[partition].forEach(pol => { //for each pol of a partition
                        linkCount += pol.getObjects().length; //a link for each object (subject ---predicate---> object)
                    });
                }

                if (linkCount > this.linkLimit) {
                    this.graphModals.filterLinks(predObjListMap).then(
                        (visiblePreds: ARTURIResource[]) => {
                            let links: Link[] = [];
                            for (let partition in predObjListMap) {
                                predObjListMap[partition].forEach(pol => { //for each pol of a partition
                                    let pred: ARTURIResource = pol.getPredicate();
                                    if (ResourceUtils.containsNode(visiblePreds, pred)) {
                                        let objs: ARTNode[] = pol.getObjects();
                                        objs.forEach(o => { //for each object/value
                                            links.push(new Link(node, new DataNode(o), pred));
                                        });
                                    }
                                });
                            }
                            this.graph.appendLinks(node, links);
                        },
                        cancel => {}
                    );
                } else {
                    let links: Link[] = [];
                    for (let partition in predObjListMap) {
                        predObjListMap[partition].forEach(pol => { //for each pol of a partition
                            let pred: ARTURIResource = pol.getPredicate();
                            let objs: ARTNode[] = pol.getObjects();
                            objs.forEach(o => { //for each object/value
                                links.push(new Link(node, new DataNode(o), pred));
                            });
                        });
                    }
                    this.graph.appendLinks(node, links);
                }
            }
        );
    }

    protected onNodeDblClicked(node: Node) {
        if (!this.graph.dynamic) return; //if graph is not dynamic, do nothing
        if (this.graph.hasOutgoingLink(node)) {
            this.graph.closeNode(node);
        } else {
            this.expandNode(node);
        }
    }

}