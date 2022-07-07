import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output } from "@angular/core";
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTNode, ARTURIResource, ResAttribute } from "../../models/ARTResources";
import { GraphClassAxiomFilter, GraphModelRecord } from "../../models/Graphs";
import { OWL, RDFS } from "../../models/Vocabulary";
import { GraphServices } from "../../services/graphServices";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { AbstractGraph, GraphMode } from "../abstractGraph";
import { D3Service } from "../d3/d3Services";
import { Link } from "../model/Link";
import { ModelNode } from "../model/ModelNode";
import { Node } from "../model/Node";

@Component({
    selector: 'model-graph',
    templateUrl: "./modelGraphComponent.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../graph.css']
})
export class ModelGraphComponent extends AbstractGraph {

    @Input() filters: GraphClassAxiomFilter[];
    @Output() elementSelected = new EventEmitter<Link | Node>();

    protected mode = GraphMode.modelOriented;

    /**
     * Model-oriented graph could be very expansive: an ontology could have a lot of properties and a lot of classes to be shown.
     * In order to prevent to work with a massive graph, it is available an alternative way to explore the model-oriented graph:
     * the incremental exploration. This consists in initialize the graph with a single root node (similar to the data-oriented)
     * and expanding the nodes according the policy adopted in the model-oriented graph, namely linking each node (class) with the
     * classes for which exists a range-property-domain relation or a classA-classAxiomRelation-classB relation.
     *
     * The following attribute is useful in order to tell if the incremental exploration is adopted.
     * It is initialize to true only if, during the initialization of this component, the provided graph has a (root) node provided.
     */
    incrementalExploration: boolean = false;

    private filtersDeltaMap: { [prop: string]: Link[] } = {}; //map the property of the filter with the links (only those in the graph visible) involved by the filter

    private linkLimit: number = 100; //in "normal" exploration mode, if the number of relations exceed this limit, suggest to work with the incremental mode

    /**
     * A lot of nodes might be linked with owl:Thing (as generic domain or range of properties which have no D/R defined).
     * In order to avoid too much cahos around the owl:Thing node and to distribute better the nodes, there will be multiple owl:Thing nodes.
     * The same Thing node must be reused only when it is linked to the same source/target node (obviously by a different link/predicate).
     */
    private thingNodesMap: { thingNode: ModelNode, linkedRes: ARTNode }[] = [];

    constructor(protected d3Service: D3Service, protected elementRef: ElementRef, protected ref: ChangeDetectorRef, private graphService: GraphServices,
        protected basicModals: BasicModalServices, private changeDetectorRef: ChangeDetectorRef) {
        super(d3Service, elementRef, ref, basicModals);
    }

    ngOnInit() {
        //init an empty filtersDeltaMap
        this.filters.forEach(f => {
            this.filtersDeltaMap[f.property.getURI()] = [];
        });

        if (this.graph.getNodes().length == 0) { //model graph works in "global" mode, so initialize the entire model
            UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
            this.graphService.getGraphModel().subscribe(
                (graphModel: GraphModelRecord[]) => {
                    UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);

                    let links: Link[] = this.convertModelToLinks(graphModel);

                    if (links.length > this.linkLimit) {
                        this.basicModals.confirm({ key: "STATUS.WARNING" }, { key: "MESSAGES.TOO_MUCH_LINKS_GRAPH_WARN_CONFIRM", params: { relCount: links.length } },
                            ModalType.warning
                        ).then(
                            confirm => {
                                this.appendLinks(links);
                            },
                            cancel => { }
                        );
                    } else {
                        this.appendLinks(links);
                    }
                }
            );
        } else { //model graph contains already a root node, so works in "incremental" mode
            this.incrementalExploration = true;
            this.expandNode(this.graph.getNodes()[0], true);
        }
    }

    /* ============== ACTIONS ============== */

    addNode(res: ARTURIResource) {
        if (this.graph.getNode(res)) {
            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.ALREADY_EXISTING_GRAPH_NODE_FOR_RESOURCE", params: { resource: res.getShow() } }, ModalType.warning);
            return;
        }
        //add the node to the graph
        let node: Node = new ModelNode(res);
        node.root = true;
        this.graph.addNode(node);
        this.graph.update();
        //expand and select the node
        this.expandNode(node, true);
    }

    /* ============== INCREMENTAL GRAPH MODEL ============== */

    protected expandNode(node: Node, selectOnComplete?: boolean) {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.graphService.expandGraphModelNode(<ARTURIResource>node.res).subscribe(
            (graphModel: GraphModelRecord[]) => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);

                let links: Link[] = this.convertModelToLinks(graphModel);
                links.forEach(l => {
                    l.openBy.push(node);
                });

                this.appendLinks(links);

                if (selectOnComplete) {
                    this.onNodeClicked(node);
                }
            }
        );
        node.open = true;
    }

    protected closeNode(node: Node) {
        //collects links from and to the node to close
        let linksToRemove: Link[] = this.graph.getLinksFrom(node);
        this.graph.getLinksTo(node).forEach(l => {
            //add only if not already in (if there are loops, the same link will be returned by getLinksFrom and getLinksTo)
            if (linksToRemove.indexOf(l) == -1) {
                linksToRemove.push(l);
            }
        });
        //remove the current node from the list of nodes that generated the link
        linksToRemove.forEach(l => {
            let idx = l.openBy.indexOf(node);
            l.openBy.splice(idx, 1);
        });
        //filter out (from the links to remove) the links that were generated by the expansion of other nodes too
        for (let i = linksToRemove.length - 1; i >= 0; i--) {
            if (linksToRemove[i].openBy.length > 0) {
                linksToRemove.splice(i, 1);
            }
        }
        //remove the links
        this.removeLinks(linksToRemove);
        //now update the filters delta map removing the closed node from the delta-links and eventually remove the links with empty openBy
        this.filters.forEach(f => {
            let delta = this.filtersDeltaMap[f.property.getURI()];
            for (let i = delta.length - 1; i >= 0; i--) {
                let idx = delta[i].openBy.indexOf(node); //look for the closed node in the openBy list of the delta-links
                if (idx != -1) { //found => remove the node from the openBy of the delta-link
                    delta[i].openBy.splice(idx, 1);
                    if (delta[i].openBy.length == 0) { //if delta link has no more node in openBy list => links has no more node that opened it
                        delta.splice(i, 1); //then remove the link from the delta
                    }
                }
            }
        });
        node.open = false;
    }

    /* ============== BOTH MODELS ============== */

    /**
     * Appends the provided links to the graph (except the filtered ones) and keeps updated the delta filter map
     */
    private appendLinks(links: Link[]) {
        let linksToNotShow: Link[] = []; //Collects the links that are added to the graph but that, according the filters, should not be shown.
        links.forEach(l => {
            if (l.res.equals(RDFS.subClassOf) && l.target.res.equals(OWL.thing)) {
                //if the relation is about rdfs:subClassOf owl:Thing, just add the source node (a root node) to the graph (if not yet in)
                if (!this.graph.getNodes().some(n => n.res.equals(l.source.res))) {
                    this.graph.addNode(l.source);
                }
            } else {
                //if the link is already in the graph, update the openBy list and skip the add
                let linkInGraph = this.graph.getLink(l.source.res, l.res, l.target.res);
                if (linkInGraph != null) {
                    linkInGraph.openBy.push(...l.openBy);
                } else { //link does not exist in graph => use it
                    //update the source and target nodes of the link with the same nodes retrieved from the graph
                    let sourceNode = this.retrieveNode(<ModelNode>l.source, l.target.res);
                    l.source = sourceNode;
                    let targetNode = this.retrieveNode(<ModelNode>l.target, l.source.res);
                    l.target = targetNode;

                    //update the filter map
                    this.filters.forEach(f => {
                        if (f.property.equals(l.res)) { //link is about a filtered relation
                            let delta = this.filtersDeltaMap[l.res.getURI()]; //here l.res is for sure a filter property since show is false only in that case
                            let alreadyInDelta = false;
                            delta.forEach(dl => {
                                if (dl.source == l.source && dl.res.equals(l.res) && dl.target == l.target) {
                                    alreadyInDelta = true;
                                }
                            });
                            if (!alreadyInDelta) {
                                delta.push(l);
                            }
                            //check also if link should be shown according the filter
                            if (!f.show) {
                                linksToNotShow.push(l); //links is about a filtered relation which "show" is false (so must be removed)
                            }
                        }
                    });
                    //update the incoming-outgoing nodes of both source and target
                    (<ModelNode>sourceNode).outgoingNodes.push(targetNode);
                    (<ModelNode>targetNode).incomingNodes.push(sourceNode);
                    //add the link to the graph
                    this.graph.addLink(l);
                }
            }
        });
        //Now that all the links are added, removes the collected links that should be hidden according the filters
        this.removeLinks(linksToNotShow);
    }

    private removeLinks(links: Link[]) {
        links.forEach(l => {
            //remove the link
            let removingLink = this.graph.getLink(l.source.res, l.res, l.target.res);
            this.graph.removeLink(removingLink);
            this.onElementRemoved(removingLink);
            //remove eventual pending nodes
            let sourceNode = <ModelNode>removingLink.source;
            let targetNode = <ModelNode>removingLink.target;
            sourceNode.removeOutgoingNode(targetNode);
            targetNode.removeIncomingNode(sourceNode);
            if (!sourceNode.root && sourceNode.incomingNodes.length == 0 && sourceNode.outgoingNodes.length == 0) {
                this.graph.removeNode(sourceNode);
                this.onElementRemoved(sourceNode);
                //if removed node is owl:Thing, remove it also from the thingNodesMap
                if (sourceNode.res.equals(OWL.thing)) {
                    this.removeThingNodeFromMap(sourceNode);
                }
            }
            if (!targetNode.root && targetNode.incomingNodes.length == 0 && targetNode.outgoingNodes.length == 0) {
                this.graph.removeNode(targetNode);
                this.onElementRemoved(targetNode);
                //if removed node is owl:Thing, remove it also from the thingNodesMap
                if (targetNode.res.equals(OWL.thing)) {
                    this.removeThingNodeFromMap(targetNode);
                }
            }
        });
        this.graph.update();
    }

    /* ================= FILTERS AND LINKS DELTA HANDLERS ================== */

    /**
     * Adds or Removes links and nodes according to the "show" of the given filter
     * 
     * This method is public in order to allow the container panel to force the graph update when the filters change.
     * I cannot exploit the ngOnChanges() method since it doesn't detect changes when the content of the 'filters' @Input() changes
     * (the content changes but the reference to the object is still the same)
     * 
     * @param updatedFilter
     */
    public applyFilter(updatedFilter: GraphClassAxiomFilter) {
        let links = this.filtersDeltaMap[updatedFilter.property.getURI()];
        if (links.length == 0) return; //no delta links for the given filter property
        if (updatedFilter.show) { //from hide to show
            //add the links to the graph
            this.appendLinks(links);
        } else { //from show to hide
            //remove the links from the graph
            this.removeLinks(links);
        }
    }

    /**
     * Returns the links with the given property. This method is useful during the initialization of the filtersDelta
     * structure, useful to show/hide of links and nodes when changing the filters
     * @param graph
     * @param property
     */
    private getLinksDeltaForProperty(links: Link[], property: ARTURIResource) {
        let delta: Link[] = [];
        links.forEach(l => {
            if (l.res.equals(property)) {
                delta.push(l);
            }
        });
        return delta;
    }

    /**
     * Converts the GraphModelRecord(s) (returned by getGraphModel() and expandGraphModelNode() services) into a list of nodes and links
     */
    private convertModelToLinks(graphModel: GraphModelRecord[]): Link[] {
        let links: Link[] = [];
        //set the nodes and the links according the model
        graphModel.forEach(record => {
            let nodeSource: ModelNode = new ModelNode(record.source);
            let nodeTarget: ModelNode = new ModelNode(record.target);
            links.push(new Link(nodeSource, nodeTarget, record.link, record.classAxiom));
        });
        return links;
    }

    /* ================== UTILS ================== */

    /**
     * Returns the node, for the given resource, retrieved from the graph. If it doesn't yet exist, creates a new one and returns it.
     * If the node is rdfs:Literal creates a new one each time, since node describing this resource cannot be reused.
     * If the node is owl:Thing looks into the thingNodesMap far an owl:Thing node already used for the relatedRes.
     * In case returns it, otherwise creates a new one, update the map and returns it.
     */
    private retrieveNode(node: ModelNode, relatedRes: ARTNode): ModelNode {
        let graphNode: ModelNode;
        if (node.res.getAdditionalProperty("isDatatype")) { //datatype nodes must not be reused => create a new one each time
            graphNode = node;
            this.graph.addNode(graphNode);
        } else if (node.res.equals(OWL.thing)) { //owl:Thing node can be reused only if linked with the same resource
            this.thingNodesMap.forEach(tnm => {
                if (tnm.linkedRes.equals(relatedRes)) { //a Thing node linked with relatedRes was already created => reuse it
                    graphNode = tnm.thingNode;
                }
            });
            if (graphNode == null) { //a Thing node linked with relatedRes was not already created => create it, add to the graph and update map
                graphNode = node;
                this.graph.addNode(graphNode);
                this.thingNodesMap.push({ thingNode: graphNode, linkedRes: relatedRes });
            }
        } else {
            graphNode = <ModelNode>this.graph.getNode(node.res);
            if (graphNode == null) { //node for the given resource not yet created => create it and add to the graph
                graphNode = node;
                this.graph.addNode(graphNode);
            }
        }
        return graphNode;
    }

    /**
     * Update the thingNodesMap by removing the entry when an owl:Thing node has been removed from the graph
     */
    private removeThingNodeFromMap(thingNode: ModelNode) {
        for (let i = 0; i < this.thingNodesMap.length; i++) {
            if (this.thingNodesMap[i].thingNode == thingNode) {
                this.thingNodesMap.splice(i, 1);
                return;
            }
        }
    }

    /* ================== EVENT HANDLER ================== */

    protected onNodeDblClicked(node: Node) {
        if (this.incrementalExploration) {
            //literal nodes or not explici nodes (owl:Thing, or other imported classes) are not expandable/closable
            if (!node.res.isResource() || !node.res.getAdditionalProperty(ResAttribute.EXPLICIT)) {
                return;
            }
            if (node.open) {
                this.closeNode(node);
            } else {
                this.expandNode(node);
            }
        }
    }

    private onElementRemoved(element: Node | Link) {
        if (element == this.selectedElement) {
            this.selectedElement = null;
            if (element instanceof Link) {
                this.linkAhead = null;
            }
            this.elementSelected.emit(this.selectedElement);
        }
    }
}
