import { RDFS } from './../../models/Vocabulary';
import { UmlLink } from './../model/UmlLink';
import { RDFResourceRolesEnum } from './../../models/ARTResources';
import { UmlNode } from './../model/UmlNode';
import { Injectable } from '@angular/core';
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTBNode, ARTLiteral, ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource } from '../../models/ARTResources';
import { QueryResultBinding, GraphResultBindings } from '../../models/Sparql';
import { ResourcesServices } from '../../services/resourcesServices';
import { ResourceUtils } from '../../utils/ResourceUtils';
import { GraphMode } from '../abstractGraph';
import { D3Service } from '../d3/d3Services';
import { DataNode } from '../model/DataNode';
import { ForceDirectedGraph } from '../model/ForceDirectedGraph';
import { GraphUtils } from '../model/GraphUtils';
import { Link } from '../model/Link';
import { Node } from '../model/Node';
import { GraphModal, GraphModalData } from './graphModal';
import { LinksFilterModal, LinksFilterModalData } from './linksFilterModal';
import { ModelNode } from '../model/ModelNode';
import { DataGraphContext } from '../../models/Graphs';

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
            if (!ResourceUtils.containsNode(annotatedRes, l.res)) {
                annotatedRes.push(l.res);
            }
        })
        this.resourceService.getResourcesInfo(annotatedRes).subscribe(
            resources => {
                resources.forEach(r => {
                    GraphUtils.getLinksWithPredicate(links, r).forEach(l => {
                        l.res = r;
                    })
                    let n = GraphUtils.getNodeOfValue(nodes, r);
                    if (n != null) {
                        n.res = r;
                    }
                })
                let graph: ForceDirectedGraph = this.d3Service.getForceDirectedGraph(nodes, links, false);
                var modalData = new GraphModalData(graph, GraphMode.dataOriented, true, null, DataGraphContext.sparql);
                const builder = new BSModalContextBuilder<GraphModalData>(
                    modalData, undefined, GraphModalData
                );
                let overlayConfig: OverlayConfig = { context: builder.dialogClass("modal-dialog modal-xl").keyboard(27).toJSON() };
                return this.modal.open(GraphModal, overlayConfig).result;
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
        var modalData = new GraphModalData(graph, GraphMode.dataOriented, rendering, resource.getRole());
        const builder = new BSModalContextBuilder<GraphModalData>(
            modalData, undefined, GraphModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.dialogClass("modal-dialog modal-xl").keyboard(27).toJSON() };
        return this.modal.open(GraphModal, overlayConfig).result;
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
        var modalData = new GraphModalData(graph, GraphMode.modelOriented, rendering);
        const builder = new BSModalContextBuilder<GraphModalData>(
            modalData, undefined, GraphModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.dialogClass("modal-dialog modal-xl").keyboard(27).toJSON() };
        return this.modal.open(GraphModal, overlayConfig).result;
    }

    filterLinks(predObjListMap: { [partition: string]: ARTPredicateObjects[] }) {
        var modalData = new LinksFilterModalData(predObjListMap);
        const builder = new BSModalContextBuilder<LinksFilterModalData>(
            modalData, undefined, LinksFilterModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(LinksFilterModal, overlayConfig).result;

    }


    openUmlGraph(rendering: boolean) {
        // let prova1 = new ARTURIResource("http://baseUri/Persona","Persona", RDFResourceRolesEnum.cls);
        // let prova2 = new ARTURIResource("http://baseUri/Animale","Animale", RDFResourceRolesEnum.cls);
        // let prova3 = new ARTURIResource("http://baseUri/compra","compra", RDFResourceRolesEnum.property);
        // let prova4 = new ARTURIResource("http://baseUri/amicoDi","amicoDi", RDFResourceRolesEnum.property);
        // let prova5 = new ARTURIResource("http://baseUri/haAnimale","haAnimale", RDFResourceRolesEnum.property);
        // let prova6 = new ARTURIResource("http://baseUri/haNome","haNome", RDFResourceRolesEnum.property);
        // let prova7 = new ARTURIResource("http://baseUri/haMq","haMq", RDFResourceRolesEnum.property);
        // let prova8 = new ARTURIResource("http://baseUri/haCasa","haCasa", RDFResourceRolesEnum.property);
        // let prova9 = new ARTURIResource("http://baseUri/Casa","Casa", RDFResourceRolesEnum.cls);
        // let prova10 = new ARTURIResource("http://baseUri/Moglie","Moglie", RDFResourceRolesEnum.cls);
        // let prova11 = new ARTURIResource("http://baseUri/Marito","Marito", RDFResourceRolesEnum.cls);
        // let prova12 = new ARTURIResource("http://baseUri/èSposato","èSposato", RDFResourceRolesEnum.property);
        // prova12.setAdditionalProperty("reflexive",true);
        

        // let nodoPersona = new UmlNode(prova1);
        // let nodoAnimale = new UmlNode(prova2);
        // let nodoCasa = new UmlNode(prova9);
        // let nodoMoglie = new UmlNode(prova10);
        // let nodoMarito = new UmlNode(prova11);

        // nodoPersona.listProperties = [prova3, prova5, prova4, prova8]
        // nodoAnimale.listProperties = [prova6]
        // nodoCasa.listProperties = [prova7]
        // nodoMoglie.listProperties = [prova12]
        // nodoMarito.listProperties = [prova12, RDFS.subClassOf]
        // let nodes: Array<Node> = [nodoPersona, nodoAnimale, nodoCasa, nodoMarito, nodoMoglie];

        // let link1 = new UmlLink(nodoPersona, nodoCasa, prova3)
        // let link2 = new UmlLink(nodoPersona, nodoCasa, prova8)
        // let link3 = new UmlLink(nodoPersona, nodoAnimale, prova5)
        // let link4 = new UmlLink(nodoPersona, nodoPersona, prova4)
        // let link5 = new UmlLink(nodoMarito, nodoMoglie, prova12)
        // let link6 = new UmlLink(nodoMarito, nodoPersona,  RDFS.subClassOf)



        // let links = [link1, link2, link3, link4, link5, link6];
        // console.log(links);



        
        let graph = new ForceDirectedGraph([], [], rendering);
        //let graph: ForceDirectedGraph = this.d3Service.getForceDirectedGraph([], []);
        var umlData = new GraphModalData(graph, GraphMode.umlOriented, rendering); // dati da iniettare dentro il pannello
        // finestre modali libreria ngx modialog
        const builder = new BSModalContextBuilder<GraphModalData>(
            umlData, undefined, GraphModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.dialogClass("modal-dialog modal-xl").keyboard(27).toJSON() };
        return this.modal.open(GraphModal, overlayConfig).result;
    }

}