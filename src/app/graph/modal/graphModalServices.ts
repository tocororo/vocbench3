import { Injectable } from '@angular/core';
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTBNode, ARTLiteral, ARTNode, ARTResource, ARTURIResource, ResourceUtils } from '../../models/ARTResources';
import { GraphBinding, GraphResultBindings } from '../../models/Sparql';
import { ResourcesServices } from '../../services/resourcesServices';
import { D3Service } from '../d3/d3Services';
import { ForceDirectedGraph } from '../model/ForceDirectedGraph';
import { Link } from '../model/Link';
import { Node } from '../model/Node';
import { GraphMode } from '../abstractGraph';
import { GraphModal, GraphModalData } from './graphModal';

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

            let nodeSubj: Node = this.getNodeOfValue(nodes, subj);
            let nodeObj: Node = this.getNodeOfValue(nodes, obj);
            if (nodeSubj == null) {
                nodeSubj = new Node(subj);
                nodes.push(nodeSubj);
            }
            if (nodeObj == null) {
                nodeObj = new Node(obj);
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
                    this.getLinksWithPredicate(links, r).forEach(l => {
                        l.predicate = r;
                    })
                    let n = this.getNodeOfValue(nodes, r);
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
    private getNodeOfValue(nodes: Node[], value: ARTNode): Node {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].res.getNominalValue() == value.getNominalValue()) {
                return nodes[i];
            }
        }
        return null;
    }
    private getLinksWithPredicate(links: Link[], value: ARTURIResource): Link[] {
        let linksWithPred: Link[] = [];
        for (let i = 0; i < links.length; i++) {
            if (links[i].predicate.getNominalValue() == value.getNominalValue()) {
                linksWithPred.push(links[i]);
            }
        }
        return linksWithPred;
    }

    openExplorationGraph(resource: ARTURIResource, mode: GraphMode) {
        let graph: ForceDirectedGraph = this.d3Service.getForceDirectedGraph([new Node(resource)], []);
        var modalData = new GraphModalData(graph, mode);
        const builder = new BSModalContextBuilder<GraphModalData>(
            modalData, undefined, GraphModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.dialogClass("modal-dialog modal-xl").keyboard(27).toJSON() };
        return this.modal.open(GraphModal, overlayConfig).result;
    }

}