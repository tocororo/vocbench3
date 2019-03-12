import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from "@angular/core";
import { ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, ResAttribute } from "../../models/ARTResources";
import { ResViewPartition } from "../../models/ResourceView";
import { ResourceViewServices } from "../../services/resourceViewServices";
import { Deserializer } from "../../utils/Deserializer";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { VBProperties } from "../../utils/VBProperties";
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
        private resViewService: ResourceViewServices, private graphModals: GraphModalServices, private vbProp: VBProperties) {
        super(d3Service, elementRef, ref);
    }

    private expandNode(node: Node) {
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

                for (let partition in predObjListMap) {
                    this.filterValueLanguageFromPrefObjList(predObjListMap[partition]);
                }

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
                            this.appendLinks(node, links);
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
                    this.appendLinks(node, links);
                }
            }
        );
    }

    /**
     * Append the links to the given node. If the target of the links doesn't exist yet, it is created.
     * @param sourceNode 
     * @param links 
     */
    private appendLinks(sourceNode: Node, links: Link[]) {
        links.forEach(link => {
            let targetNode = this.graph.getNode(link.target.res);
            //add the target node to the nodes array only if it is not already in (it prevents the creation of multiple nodes for the same resource)
            if (targetNode == null) {
                targetNode = link.target;
                //set the same x and y of the parent
                targetNode.x = sourceNode.x;
                targetNode.y = sourceNode.y;
                this.graph.nodes.push(link.target)
            } else { //otherwise replaces the target node in the link with the one already existing in the graph
                link.target = targetNode;
            }
            //add the sourceNode to the openBy nodes of targetNode
            (<DataNode>targetNode).openBy.push(sourceNode);

            this.graph.links.push(link);
        });

        this.graph.update();
    }


    private closeNode(node: Node) {
        this.deleteSubtree(node);
        this.graph.update();
    }

    /**
     * Delete the subtree rooted on the given node. Useful when closing a node.
     * @param node 
     */
    private deleteSubtree(node: Node) {
        let recursivelyClosingNodes: Node[] = []; //nodes target in the removed links that needs to be closed in turn
        let linksFromNode: Link[] = this.graph.getLinksFrom(node);
        if (linksFromNode.length > 0) {
            //removes links with the node as source
            linksFromNode.forEach(l => {
                //remove the source node from the openBy nodes of the target
                let targetDataNode = <DataNode>l.target;
                targetDataNode.removeOpenByNode(l.source);
                //remove the link
                this.graph.links.splice(this.graph.links.indexOf(l), 1);
                //if now the openBy list of the target is empty, it means that the node would be detached from the graph
                if (targetDataNode.isPending()) {
                    this.graph.nodes.splice(this.graph.nodes.indexOf(l.target), 1); //remove the node from the graph
                    recursivelyClosingNodes.push(l.target); //add to the list of nodes to recursively close
                }
            })
            //call recursively the deletion of the subtree for the deleted node)
            recursivelyClosingNodes.forEach(n => {
                this.deleteSubtree(n);
            });
        }
    }

    private filterValueLanguageFromPrefObjList(predObjList: ARTPredicateObjects[]) {
        let valueFilterLangEnabled = this.vbProp.getValueFilterLanguages().enabled;
        if (valueFilterLangEnabled) {
            let valueFilterLanguages = this.vbProp.getValueFilterLanguages().languages;
            for (var i = 0; i < predObjList.length; i++) {
                var objList: ARTNode[] = predObjList[i].getObjects();
                for (var j = 0; j < objList.length; j++) {
                    let lang = objList[j].getAdditionalProperty(ResAttribute.LANG);
                    //remove the object if it has a language not in the languages list of the filter
                    if (lang != null && valueFilterLanguages.indexOf(lang) == -1) {
                        objList.splice(j, 1);
                        j--;
                    }
                }
                //after filtering the objects list, if the predicate has no more objects, remove it from predObjList
                if (objList.length == 0) {
                    predObjList.splice(i, 1);
                    i--;
                }
            }
        }
    }

    protected onNodeDblClicked(node: DataNode) {
        if (!this.graph.dynamic) return; //if graph is not dynamic, do nothing
        if (this.graph.hasOutgoingLink(node)) {
            this.closeNode(node);
        } else {
            this.expandNode(node);
        }
    }

}