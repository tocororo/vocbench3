import { Injectable } from '@angular/core';
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTBNode, ARTLiteral, ARTNode, ARTResource, ARTURIResource, ResourceUtils } from '../../models/ARTResources';
import { GraphBinding, GraphResultBindings } from '../../models/Sparql';
import { ResourcesServices } from '../../services/resourcesServices';
import { GraphMode } from '../abstractGraph';
import { D3Service } from '../d3/d3Services';
import { ForceDirectedGraph } from '../model/ForceDirectedGraph';
import { GraphUtils } from '../model/GraphUtils';
import { Link } from '../model/Link';
import { Node } from '../model/Node';
import { GraphModal, GraphModalData } from './graphModal';
import { DataNode } from '../model/DataNode';

@Injectable()
export class GraphModalServices {

    constructor(private modal: Modal, private d3Service: D3Service, private resourceService: ResourcesServices) { }

    openGraphQuertyResult(result: GraphResultBindings[]) {
        //creates nodes and links
        let nodes: Node[] = [];
        let links: Link[] = [];
        result.forEach(binding => {
            let subj: ARTResource = <ARTResource>this.convertBindingToValue(binding.subj);
            let pred: ARTURIResource = <ARTURIResource>this.convertBindingToValue(binding.pred);
            let obj: ARTNode = this.convertBindingToValue(binding.obj);

            let nodeSubj: Node = GraphUtils.getNodeOfValue(nodes, subj);
            let nodeObj: Node = GraphUtils.getNodeOfValue(nodes, obj);
            if (nodeSubj == null) {
                nodeSubj = new DataNode(subj);
                nodes.push(nodeSubj);
            }
            if (nodeObj == null) {
                nodeObj = new DataNode(obj);
                nodes.push(nodeObj);
            }
            links.push(new Link(nodeSubj, nodeObj, pred));
        });

        //replaces "generic" resources in nodes and links with the annotated resource
        let annotatedRes: ARTURIResource[] = [];
        nodes.forEach(n => {
            if (n.res.isURIResource()) {
                annotatedRes.push(<ARTURIResource>n.res);
            }
        });
        links.forEach(l => {
            if (!ResourceUtils.containsNode(annotatedRes, l.predicate)) {
                annotatedRes.push(l.predicate);
            }
        })
        this.resourceService.getResourcesInfo(annotatedRes).subscribe(
            resources => {
                resources.forEach(r => {
                    GraphUtils.getLinksWithPredicate(links, r).forEach(l => {
                        l.predicate = r;
                    })
                    let n = GraphUtils.getNodeOfValue(nodes, r);
                    if (n != null) {
                        n.res = r;
                    }
                })
                let graph: ForceDirectedGraph = this.d3Service.getForceDirectedGraph(nodes, links);
                var modalData = new GraphModalData(graph, GraphMode.dataOriented);
                const builder = new BSModalContextBuilder<GraphModalData>(
                    modalData, undefined, GraphModalData
                );
                let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size("lg").toJSON() };
                return this.modal.open(GraphModal, overlayConfig).result;
            }
        );
    }

    private convertBindingToValue(binding: GraphBinding): ARTNode {
        if (binding.type == "uri") {
            return new ARTURIResource(binding.value);
        } else if (binding.type == "bnode") {
            return new ARTBNode("_:" + binding.value);
        } else { //literal
            return new ARTLiteral(binding.value, binding.datatype, binding["xml:lang"]);
        }
    }

    openDataGraph(resource: ARTURIResource) {
        let rootNode: Node = new DataNode(resource);
        rootNode.openBy.push(rootNode); //add itseld to the openBy list, so it cannot be close in case of loop.
        let graph: ForceDirectedGraph = this.d3Service.getForceDirectedGraph([rootNode], []);
        var modalData = new GraphModalData(graph, GraphMode.dataOriented);
        const builder = new BSModalContextBuilder<GraphModalData>(
            modalData, undefined, GraphModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.dialogClass("modal-dialog modal-xl").keyboard(27).toJSON() };
        return this.modal.open(GraphModal, overlayConfig).result;
    }

    openModelGraph() {
        let graph: ForceDirectedGraph = this.d3Service.getForceDirectedGraph([], []);
        var modalData = new GraphModalData(graph, GraphMode.modelOriented);
        const builder = new BSModalContextBuilder<GraphModalData>(
            modalData, undefined, GraphModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.dialogClass("modal-dialog modal-xl").keyboard(27).toJSON() };
        return this.modal.open(GraphModal, overlayConfig).result;
    }

}