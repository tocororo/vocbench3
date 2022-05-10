import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { ARTBNode, ARTLiteral, ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource } from '../../models/ARTResources';
import { DataGraphContext } from '../../models/Graphs';
import { GraphResultBindings, QueryResultBinding } from '../../models/Sparql';
import { ResourcesServices } from '../../services/resourcesServices';
import { ResourceUtils } from '../../utils/ResourceUtils';
import { GraphMode } from '../abstractGraph';
import { D3Service } from '../d3/d3Services';
import { DataNode } from '../model/DataNode';
import { ForceDirectedGraph } from '../model/ForceDirectedGraph';
import { GraphUtils } from '../model/GraphUtils';
import { Link } from '../model/Link';
import { ModelNode } from '../model/ModelNode';
import { Node } from '../model/Node';
import { GraphModal } from './graphModal';
import { LinksFilterModal } from './linksFilterModal';

@Injectable()
export class GraphModalServices {

    constructor(private modalService: NgbModal, private d3Service: D3Service, private resourceService: ResourcesServices) { }

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
            if (!ResourceUtils.containsNode(annotatedRes, l.res)) {
                annotatedRes.push(l.res);
            }
        });
        this.resourceService.getResourcesInfo(annotatedRes).subscribe(
            resources => {
                resources.forEach(r => {
                    GraphUtils.getLinksWithPredicate(links, <ARTURIResource>r).forEach(l => {
                        l.res = <ARTURIResource>r;
                    });
                    let n = GraphUtils.getNodeOfValue(nodes, r);
                    if (n != null) {
                        n.res = r;
                    }
                });
                let graph: ForceDirectedGraph = this.d3Service.getForceDirectedGraph(nodes, links, false);
                const modalRef: NgbModalRef = this.modalService.open(GraphModal, new ModalOptions('full'));
                modalRef.componentInstance.graph = graph;
                modalRef.componentInstance.mode = GraphMode.dataOriented;
                modalRef.componentInstance.rendering = true;
                modalRef.componentInstance.role = null;
                modalRef.componentInstance.context = DataGraphContext.sparql;
                return modalRef.result;
            }
        );
    }

    private convertBindingToValue(binding: QueryResultBinding): ARTNode {
        if (binding.type == "uri") {
            return new ARTURIResource(binding.value);
        } else if (binding.type == "bnode") {
            return new ARTBNode("_:" + binding.value);
        } else { //literal
            return new ARTLiteral(binding.value, binding.datatype, binding["xml:lang"]);
        }
    }

    openDataGraph(resource: ARTResource, rendering: boolean) {
        let rootNode: DataNode = new DataNode(resource);
        rootNode.root = true; //so it cannot be close in case of loop.
        let graph: ForceDirectedGraph = this.d3Service.getForceDirectedGraph([rootNode], []);
        const modalRef: NgbModalRef = this.modalService.open(GraphModal, new ModalOptions('full'));
        modalRef.componentInstance.graph = graph;
        modalRef.componentInstance.mode = GraphMode.dataOriented;
        modalRef.componentInstance.rendering = rendering;
        modalRef.componentInstance.role = resource.getRole();
        return modalRef.result;
    }

    /**
     * Open a model-oriented graph. If a resource is provided, the exploration in incremental, otherwise the graph
     * will show the entire model-graph
     * @param resource
     */
    openModelGraph(resource: ARTURIResource, rendering: boolean) {
        let nodes: Node[] = [];
        if (resource != null) {
            let rootNode: ModelNode = new ModelNode(resource);
            rootNode.root = true; //so it cannot be close in case of loop.
            nodes.push(rootNode);
        }
        let graph: ForceDirectedGraph = this.d3Service.getForceDirectedGraph(nodes, []);
        const modalRef: NgbModalRef = this.modalService.open(GraphModal, new ModalOptions('full'));
        modalRef.componentInstance.graph = graph;
        modalRef.componentInstance.mode = GraphMode.modelOriented;
        modalRef.componentInstance.rendering = rendering;
        return modalRef.result;
    }

    filterLinks(predObjListMap: { [partition: string]: ARTPredicateObjects[] }) {
        const modalRef: NgbModalRef = this.modalService.open(LinksFilterModal, new ModalOptions());
        modalRef.componentInstance.predObjListMap = predObjListMap;
        return modalRef.result;
    }


    openUmlGraph(rendering: boolean) {
        let graph = new ForceDirectedGraph([], [], rendering);
        const modalRef: NgbModalRef = this.modalService.open(GraphModal, new ModalOptions('full'));
        modalRef.componentInstance.graph = graph;
        modalRef.componentInstance.mode = GraphMode.umlOriented;
        modalRef.componentInstance.rendering = rendering;
        return modalRef.result;
    }

}