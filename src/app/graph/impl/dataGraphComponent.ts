import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from "@angular/core";
import { ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, ResAttribute } from "../../models/ARTResources";
import { GraphModelRecord } from "../../models/Graphs";
import { ResViewPartition, ResViewUtils } from "../../models/ResourceView";
import { GraphServices } from "../../services/graphServices";
import { ResourceViewServices } from "../../services/resourceViewServices";
import { Deserializer } from "../../utils/Deserializer";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { VBProperties } from "../../utils/VBProperties";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
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

    private rvPartitions: ResViewPartition[] = ResViewUtils.orderedResourceViewPartitions;

    constructor(protected d3Service: D3Service, protected elementRef: ElementRef, protected ref: ChangeDetectorRef, protected basicModals: BasicModalServices,
        private resViewService: ResourceViewServices, private graphService: GraphServices, private graphModals: GraphModalServices, private vbProp: VBProperties) {
        super(d3Service, elementRef, ref, basicModals);
    }

    ngOnInit() {
        this.expandNode(this.graph.getNodes()[0], true);
    }

    addNode(res: ARTURIResource) {
        if (this.graph.getNode(res)) {
            this.basicModals.alert("Add node", "Cannot add a new node for " + res.getShow() + " since a node for the same resource already exists", "warning");
            return;
        }

        let node: DataNode = new DataNode(res);
        node.root = true;
        this.graph.addNode(node);
        this.expandNode(node, true);
    }

    expandSub() {
        this.graphService.expandSubResources(<ARTURIResource>this.selectedElement.res).subscribe(
            (graphModel: GraphModelRecord[]) => {
                let links: Link[] = this.convertModelToLinks(graphModel);
                this.appendLinks(<Node>this.selectedElement, links);
            }
        );
    }

    expandSuper() {
        this.graphService.expandSuperResources(<ARTURIResource>this.selectedElement.res).subscribe(
            (graphModel: GraphModelRecord[]) => {
                let links: Link[] = this.convertModelToLinks(graphModel);
                this.appendLinks(<Node>this.selectedElement, links);
            }
        );
    }

    protected expandNode(node: Node, selectOnComplete?: boolean) {
        if (!node.res.isResource()) {
            return;
        }

        this.resViewService.getResourceView(<ARTResource>node.res).subscribe(
            rv => {
                let filteredPartitions: ResViewPartition[] = this.vbProp.getResourceViewPartitionsFilter()[node.res.getRole()];
                //create the predicate-object lists for each partition (skip the filtered partition)
                let predObjListMap: { [partition: string]: ARTPredicateObjects[] } = {};
                this.rvPartitions.forEach(partition => {
                    if (filteredPartitions != null && filteredPartitions.indexOf(partition) != -1) {
                        return; //if the current partition is among the partitions filtered for the resource role => skip the parsing
                    }
                    //parse partition
                    let partitionJson = rv[partition];
                    if (partition == ResViewPartition.facets && partitionJson != null) { //dedicated handler for facets partition
                        partitionJson = partitionJson.inverseOf;
                    }
                    if (partitionJson != null) {
                        let poList: ARTPredicateObjects[] = Deserializer.createPredicateObjectsList(partitionJson);
                        predObjListMap[partition] = poList;
                    }
                });
                //filter the objects according the filter-value languages
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
                //check if the relations that it is going to add are too much
                if (linkCount > this.linkLimit) {
                    this.graphModals.filterLinks(predObjListMap).then(
                        (predicatesToHide: ARTURIResource[]) => {
                            let links: Link[] = this.convertPredObjListMapToLinks(node, predObjListMap, predicatesToHide);
                            this.appendLinks(node, links);
                            if (selectOnComplete) {
                                this.onNodeClicked(node);
                            }
                        },
                        () => {}
                    );
                } else {
                    let links: Link[] = this.convertPredObjListMapToLinks(node, predObjListMap, []);
                    this.appendLinks(node, links);
                    if (selectOnComplete) {
                        this.onNodeClicked(node);
                    }
                }
            }
        );
        node.open = true;
    }

    protected closeNode(node: Node) {
        this.deleteSubtree(node);
        
        let sourceDataNode = <DataNode>node;
        if (sourceDataNode.isPending()) {
            this.graph.removeNode(sourceDataNode); //remove the node from the graph
        }

        this.graph.update();
        node.open = false;
    }

    
    private appendLinks(expandedNode: Node, links: Link[]) {
        links.forEach(l => {

            if (this.graph.getLink(l.source.res, l.res, l.target.res) != null) {
                return;
            }

            let sourceNode = this.retrieveNode(l.source);
            l.source = sourceNode;
            let targetNode = this.retrieveNode(l.target);
            l.target = targetNode;

            if (expandedNode == sourceNode) {
                (<DataNode>targetNode).openBy.push(expandedNode);
            }

            this.graph.addLink(l);
        });

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
                this.graph.removeLink(l);
                //if now the openBy list of the target is empty, it means that the node would be detached from the graph
                if (targetDataNode.isPending()) {
                    this.graph.removeNode(targetDataNode); //remove the node from the graph
                    recursivelyClosingNodes.push(targetDataNode); //add to the list of nodes to recursively close
                }
            })
            //call recursively the deletion of the subtree for the deleted node)
            recursivelyClosingNodes.forEach(n => {
                this.deleteSubtree(n);
            });
        }
    }

    /* ================== UTILS ================== */

    /**
     * Converts the map between partitions and predicate-objects lists to a list of links.
     * Filters the convertion according the list of predicates to hide
     * @param sourceNode source node of the links
     * @param predObjListMap 
     * @param predicatesToHide 
     */
    private convertPredObjListMapToLinks(sourceNode: Node, predObjListMap: { [partition: string]: ARTPredicateObjects[] }, predicatesToHide: ARTURIResource[]): Link[] {
        let hideLiteralNodes: boolean = this.vbProp.getHideLiteralGraphNodes();
        let links: Link[] = [];
        for (let partition in predObjListMap) {
            predObjListMap[partition].forEach(pol => { //for each pol of a partition
                let pred: ARTURIResource = pol.getPredicate();
                if (!ResourceUtils.containsNode(predicatesToHide, pred)) {
                    let objs: ARTNode[] = pol.getObjects();
                    objs.forEach(o => { //for each object/value
                        if (hideLiteralNodes && o.isLiteral()) {
                            return; //if the literal should be hidden and the object is literal, skip the link
                        }
                        links.push(new Link(sourceNode, new DataNode(o), pred));
                    });
                }
            });
        }
        return links;
    }

    /**
     * Converts the GraphModelRecord(s) (returned by getGraphModel() and expandGraphModelNode() services) into a list of nodes and links
     */
    private convertModelToLinks(graphModel: GraphModelRecord[]): Link[] {
        let links: Link[] = [];
        //set the nodes and the links according the model
        graphModel.forEach(record => {
            let nodeSource: DataNode = new DataNode(record.source);
            let nodeTarget: DataNode = new DataNode(record.target);
            links.push(new Link(nodeSource, nodeTarget, record.link, record.classAxiom));
        });
        return links;
    }

    /**
     * Filters the objects list according the value-filter languages
     * @param predObjList 
     */
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

    private retrieveNode(node: Node): Node {
        let graphNode: Node;
        graphNode = <Node>this.graph.getNode(node.res);
        if (graphNode == null) { //node for the given resource not yet created => create it and add to the graph
            graphNode = node;
            this.graph.addNode(graphNode);
        }
        return graphNode;
    }


    /* ================== EVENT HANDLER ================== */

    protected onNodeDblClicked(node: DataNode) {
        if (!this.graph.dynamic) return; //if graph is not dynamic, do nothing
        if (node.open) {
            this.closeNode(node);
        } else {
            this.expandNode(node);
        }
    }

}