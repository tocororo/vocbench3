import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input } from "@angular/core";
import { ARTURIResource } from "../../models/ARTResources";
import { GraphClassAxiomFilter, GraphModelRecord } from "../../models/Graphs";
import { OWL, RDFS } from "../../models/Vocabulary";
import { GraphServices } from "../../services/graphServices";
import { UIUtils } from "../../utils/UIUtils";
import { AbstractGraph, GraphMode } from "../abstractGraph";
import { D3Service } from "../d3/d3Services";
import { GraphUtils } from "../model/GraphUtils";
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

    protected mode = GraphMode.modelOriented;

    private filtersDelta: Map<string, Link[]>; //map the property of the filter with the links involved by the filter

    constructor(protected d3Service: D3Service, protected elementRef: ElementRef, protected ref: ChangeDetectorRef, private graphService: GraphServices) {
        super(d3Service, elementRef, ref);
    }

    ngOnInit() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);

        this.graphService.getGraphModel().subscribe(
            (graphModel: GraphModelRecord[]) => {
                let workingGraph: GraphStruct = this.convertModelToGraph(graphModel);
                this.filtersDelta = new Map();
                this.filters.forEach(f => {
                    this.filtersDelta.set(f.property.getURI(), this.getLinksDeltaForProperty(workingGraph, f.property))
                });

                this.graph.nodes = workingGraph.nodes;
                this.graph.links = workingGraph.links;

                this.filters.forEach(f => {
                    if (!f.show) { //apply the filter only for the filter disabled in order to hide the filtered links and nodes
                        this.applyFilters(f);
                    }
                });

                this.graph.update();

                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
            }
        )
    }

    /**
     * Converts the GraphModelRecord(s) returned by getGraphModel() service into a list of nodes and links
     */
    private convertModelToGraph(graphModel: GraphModelRecord[]): GraphStruct {
        //creates nodes and links
        let nodes: Node[] = [];
        let links: Link[] = [];
        /**
         * A lot of nodes might be linked with owl:Thing (as generic domain or range of properties which have no D/R defined).
         * In order to avoid too much cahos around the owl:Thing node and to distribute better the nodes,
         * there will be multiple owl:Thing nodes. The same Thing node must be reused only when it is linked to the same
         * source/target node (obviously by a different link/predicate)
         */
        let thingNodes: { thingNode: Node, linkedRes: ARTURIResource }[] = [];

        //set the nodes and the links according the model
        graphModel.forEach(record => {
            //SOURCE
            let nodeSource: Node;
            //special cases: owl:Thing (one node for each linked res) and rdfs:Literal (different node each time)
            if (record.source.equals(OWL.thing)) {
                //checks if a Thing node has been already initialized for the linked resource (target)
                thingNodes.forEach(n => {
                    if (n.linkedRes.equals(record.target)) {
                        nodeSource = n.thingNode;
                    }
                });
                if (nodeSource == null) { //Thing node never initialized for the linked resource (target) => initialize it
                    nodeSource = new ModelNode(record.source);
                    nodes.push(nodeSource);
                    thingNodes.push({ thingNode: nodeSource, linkedRes: record.target })
                }
            } else if (record.source.equals(RDFS.literal)) {
                nodeSource = new ModelNode(record.source);
                nodes.push(nodeSource);
            } else { //other cases
                nodeSource = GraphUtils.getNodeOfValue(nodes, record.source); //try to retrieve the same node (if already initialized)
                if (nodeSource == null) { //if never initialized, initialize it now
                    nodeSource = new ModelNode(record.source);
                    nodes.push(nodeSource);
                }
            }

            //TARGET
            let nodeTarget: Node;
            //special cases: owl:Thing (one node for each linked res) and rdfs:Literal (different node each time)
            if (record.target.equals(OWL.thing)) {
                //checks if a Thing node has been already initialized for the linked resource (source)
                thingNodes.forEach(n => {
                    if (n.linkedRes.equals(record.source)) {
                        nodeTarget = n.thingNode;
                    }
                });
                if (nodeTarget == null) { //Thing node never initialized for the linked resource (source) => initialize it
                    nodeTarget = new ModelNode(record.target);
                    nodes.push(nodeTarget);
                    thingNodes.push({ thingNode: nodeTarget, linkedRes: record.source })
                }
            } else if (record.target.equals(RDFS.literal)) {
                nodeTarget = new ModelNode(record.target);
                nodes.push(nodeTarget);
            } else { //other cases
                nodeTarget = GraphUtils.getNodeOfValue(nodes, record.target); //try to retrieve the same node (if already initialized)
                if (nodeTarget == null) { //if never initialized, initialize it now
                    nodeTarget = new ModelNode(record.target);
                    nodes.push(nodeTarget);
                }
            }

            nodeSource.outgoingNodes.push(nodeTarget);
            nodeTarget.incomingNodes.push(nodeSource);

            links.push(new Link(nodeSource, nodeTarget, record.link, record.classAxiom));
        });

        return { nodes: nodes, links: links };
    }

    /**
     * Returns the links with the given property. This method is useful during the initialization of the filtersDelta
     * structure, useful to show/hide of links and nodes when changing the filters
     * @param graph 
     * @param property 
     */
    private getLinksDeltaForProperty(graph: GraphStruct, property: ARTURIResource) {
        let links: Link[] = [];
        graph.links.forEach(l => {
            if (l.res.equals(property)) {
                links.push(l);
            }
        });
        return links;
    }

    /**
     * Adds or Removes links and nodes according to the "show" of the given filter
     * @param updatedFilter 
     */
    private applyFilters(updatedFilter: GraphClassAxiomFilter) {
        let links = this.filtersDelta.get(updatedFilter.property.getURI());
        if (updatedFilter.show) { //from hide to show
            //add the links to the graph
            links.forEach(l => {
                console.log("add link", l.source.res.getShow(), l.res.getShow(), l.target.res.getShow())
                this.graph.links.push(l);
                //update source and target nodes
                let sourceNode = this.graph.getNode(l.source.res);
                if (sourceNode == null) { //not in the graph
                    console.log("source not in graph, adding", l.source.res.getShow());
                    sourceNode = l.source;
                    this.graph.nodes.push(sourceNode);
                }
                
                let targetNode = this.graph.getNode(l.target.res);
                if (targetNode == null) { //not in the graph
                    console.log("target not in graph, adding", l.target.res.getShow());
                    targetNode = l.target;
                    this.graph.nodes.push(targetNode);
                }

                sourceNode.outgoingNodes.push(targetNode);
                targetNode.incomingNodes.push(sourceNode);
            });
        } else { //from show to hide
            //remove the links from the graph
            links.forEach(l => {
                console.log("remove link", l.source.res.getShow(), l.res.getShow(), l.target.res.getShow())
                let removingLink = this.graph.getLink(l.source.res, l.res, l.target.res);
                this.graph.links.splice(this.graph.links.indexOf(removingLink), 1);

                //remove eventual pending nodes
                let sourceNode = this.graph.getNode(removingLink.source.res);
                let targetNode = this.graph.getNode(removingLink.target.res);
                sourceNode.removeOutgoingNode(targetNode);
                targetNode.removeIncomingNode(sourceNode);

                if (sourceNode.incomingNodes.length == 0 && sourceNode.outgoingNodes.length == 0) {
                    console.log("remove node", sourceNode.res.getShow())
                    this.graph.nodes.splice(this.graph.nodes.indexOf(sourceNode), 1);
                }
                if (targetNode.incomingNodes.length == 0 && targetNode.outgoingNodes.length == 0) {
                    console.log("remove node", targetNode.res.getShow())
                    this.graph.nodes.splice(this.graph.nodes.indexOf(targetNode), 1);
                }
            });
        }
    }

    /**
     * This method allows the container panel to force the graph update when the filters change.
     * I cannot exploit the ngOnChanges() method since it doesn't detect changes when the content of the 'filters' @Input() changes
     * (the content changes but the reference to the object is still the same)
     */
    public updateGraphFilter(filter: GraphClassAxiomFilter) {
        this.applyFilters(filter);
        this.graph.update();
    }


    protected expandNode(node: Node) {
        if (!node.res.isResource()) {
            return;
        }
    }

    protected onNodeDblClicked(node: Node) {
        return
    }

}

class GraphStruct {
    nodes: Node[];
    links: Link[];
}