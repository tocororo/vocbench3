import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from "@angular/core";
import { ARTNode, ARTURIResource } from "../../models/ARTResources";
import { OWL, RDFS } from "../../models/Vocabulary";
import { GraphServices } from "../../services/graphServices";
import { ResourcesServices } from "../../services/resourcesServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { UIUtils } from "../../utils/UIUtils";
import { AbstractGraph, GraphMode } from "../abstractGraph";
import { D3Service } from "../d3/d3Services";
import { GraphUtils } from "../model/GraphUtils";
import { Link } from "../model/Link";
import { ModelNode } from "../model/ModelNode";
import { Node } from "../model/Node";

@Component({
    selector: 'graph-model',
    templateUrl: "./modelGraphComponent.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../graph.css']
})
export class ModelGraphComponent extends AbstractGraph {

    protected mode = GraphMode.modelOriented;

    constructor(protected d3Service: D3Service, protected elementRef: ElementRef, protected ref: ChangeDetectorRef,
        private graphService: GraphServices, private resourceService: ResourcesServices) {
        super(d3Service, elementRef, ref);
    }

    ngOnInit() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);

        this.graphService.getGraphModel().subscribe(
            (model: { property: string, domain: string, range: string }[]) => {
                let resUris: string[] = [];
                model.forEach(pdr => {
                    if (resUris.indexOf(pdr.property) == -1) {
                        resUris.push(pdr.property);
                    }
                    if (resUris.indexOf(pdr.domain) == -1) {
                        resUris.push(pdr.domain);
                    }
                    if (resUris.indexOf(pdr.range) == -1) {
                        resUris.push(pdr.range);
                    }
                });
                let annotatedResources: ARTURIResource[] = [];
                resUris.forEach(uri => annotatedResources.push(new ARTURIResource(uri)));

                this.resourceService.getResourcesInfo(annotatedResources).subscribe(
                    resources => {
                        //replace the "simple" resources with the annotated ones
                        resources.forEach(r => {
                            annotatedResources[ResourceUtils.indexOfNode(annotatedResources, r)] = r;
                        });
                        //create a graph model with the annotated resources
                        let modelAnnotated: { property: ARTURIResource, domain: ARTURIResource, range: ARTURIResource }[] = [];
                        model.forEach(pdr => {
                            modelAnnotated.push({
                                property: annotatedResources[ResourceUtils.indexOfNode(annotatedResources, new ARTURIResource(pdr.property))],
                                domain: annotatedResources[ResourceUtils.indexOfNode(annotatedResources, new ARTURIResource(pdr.domain))],
                                range: annotatedResources[ResourceUtils.indexOfNode(annotatedResources, new ARTURIResource(pdr.range))]
                            });
                        });

                        //creates nodes and links
                        let nodes: Node[] = [];
                        let links: Link[] = [];

                        /**
                         * A lot of nodes are linked with owl:Thing.
                         * In order to avoid too much cahos around the owl:Thing node and to distribute better the nodes,
                         * there will be multiple owl:Thing nodes. The same Thing node must be reused only when it is linked to the same
                         * source/target node (obviously by a different link/predicate)
                         */
                        let thingNodes: { thingNode: Node, linkedRes: ARTNode }[] = [];

                        //set the nodes and the links according the model
                        modelAnnotated.forEach(pdr => {
                            //DOMAIN
                            let nodeDomain: Node;
                            //special cases: owl:Thing (one node for each linked res) and rdfs:Literal (different node each time)
                            if (pdr.domain.equals(OWL.thing)) {
                                //checks if a Thing node has been already initialized for the linked resource (range)
                                thingNodes.forEach(n => {
                                    if (n.linkedRes.equals(pdr.range)) {
                                        nodeDomain = n.thingNode;
                                    }
                                });
                                if (nodeDomain == null) { //Thing node never initialized for the linked resource (range) => initialize it
                                    nodeDomain = new ModelNode(pdr.domain);
                                    nodes.push(nodeDomain);
                                    thingNodes.push({ thingNode: nodeDomain, linkedRes: pdr.range })
                                }
                            } else if (pdr.domain.equals(RDFS.literal)) {
                                nodeDomain = new ModelNode(pdr.domain);
                                nodes.push(nodeDomain);
                            } else { //other cases
                                nodeDomain = GraphUtils.getNodeOfValue(nodes, pdr.domain); //try to retrieve the same node (if already initialized)
                                if (nodeDomain == null) { //if never initialized, initialize it now
                                    nodeDomain = new ModelNode(pdr.domain);
                                    nodes.push(nodeDomain);
                                }
                            }

                            //RANGE
                            let nodeRange: Node;
                            //special cases: owl:Thing (one node for each linked res) and rdfs:Literal (different node each time)
                            if (pdr.range.equals(OWL.thing)) {
                                //checks if a Thing node has been already initialized for the linked resource (domain)
                                thingNodes.forEach(n => {
                                    if (n.linkedRes.equals(pdr.domain)) {
                                        nodeRange = n.thingNode;
                                    }
                                });
                                if (nodeRange == null) { //Thing node never initialized for the linked resource (domain) => initialize it
                                    nodeRange = new ModelNode(pdr.range);
                                    nodes.push(nodeRange);
                                    thingNodes.push({ thingNode: nodeRange, linkedRes: pdr.domain })
                                }
                            } else if (pdr.range.equals(RDFS.literal)) {
                                nodeRange = new ModelNode(pdr.range);
                                nodes.push(nodeRange);
                            } else { //other cases
                                nodeRange = GraphUtils.getNodeOfValue(nodes, pdr.range); //try to retrieve the same node (if already initialized)
                                if (nodeRange == null) { //if never initialized, initialize it now
                                    nodeRange = new ModelNode(pdr.range);
                                    nodes.push(nodeRange);
                                }
                            }

                            links.push(new Link(nodeDomain, nodeRange, pdr.property));
                        });

                        this.graph.nodes = nodes;
                        this.graph.links = links;
                        this.graph.update();

                        UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                    }
                );

            }
        )
    }

    protected expandNode(node: Node) {
        if (!node.res.isResource()) {
            return;
        }
    }

    protected onNodeDblClicked(node: Node) {
        // if (this.graph.hasOutgoingLink(node)) {
        //     this.graph.closeNode(node);
        // } else {
        //     this.expandNode(node);
        // }
    }

}