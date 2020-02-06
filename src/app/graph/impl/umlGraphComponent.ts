import { Link } from './../model/Link';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { AbstractGraph } from '../abstractGraph';
import { D3Service } from '../d3/d3Services';
import { Node } from '../model/Node';
import { ARTURIResource, ARTNode, RDFResourceRolesEnum } from './../../models/ARTResources';
import { GraphModelRecord } from './../../models/Graphs';
import { OWL, RDFS } from './../../models/Vocabulary';
import { GraphServices } from './../../services/graphServices';
import { UIUtils } from './../../utils/UIUtils';
import { BasicModalServices } from './../../widget/modal/basicModal/basicModalServices';
import { GraphMode } from './../abstractGraph';
import { UmlLink } from './../model/UmlLink';
import { UmlNode, PropInfo, NodePropRange } from './../model/UmlNode';
import { ignoreElements } from 'rxjs/operator/ignoreElements';




@Component({
    selector: 'uml-graph',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './umlGraphComponent.html',
    styleUrls: ['../graph.css']
})
export class UmlGraphComponent extends AbstractGraph {
    protected mode = GraphMode.umlOriented;
    private selectedProp: NodePropRange;
    protected activeRemove: boolean; // serve a gestire l'abilitazione del tasto removeNode(solo se clicco sul nodo si deve abilitare)
    private nodeLimit: number = 50; //if the number of relations exceeds this limit show warning to user.
    @Output() elementSelected = new EventEmitter<Node | Link | PropInfo>();
    private linksCache: Link[] = []; // contiene i link che verranno nascosti/mostrati in base alla variabile bool hide
    @Input() hideArrow: boolean;


    constructor(protected d3Service: D3Service, protected elementRef: ElementRef, protected ref: ChangeDetectorRef, protected basicModals: BasicModalServices, private graphService: GraphServices) {
        super(d3Service, elementRef, ref, basicModals);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["hideArrow"] && !changes["hideArrow"].firstChange) {
            this.updateArrows();
        }
    }

    ngOnInit() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.graphService.getGraphModel().subscribe(
            (graphModel: GraphModelRecord[]) => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);

                let graph = this.convertModelToGraph(graphModel);
                if (graph.nodes.length > this.nodeLimit) {
                    this.basicModals.confirm("Graph", "The graph you're trying to show has an high number of nodes (" + graph.nodes.length + "). " +
                        "A performance decrease could be experienced with a growing amount of visual elements in the graph. " +
                        "Do you want to show the graph anyway?",
                        "warning"
                    ).then(
                        confirm => {
                            this.initGraph(graph);
                        },
                        cancel => { }
                    )
                } else {
                    this.initGraph(graph);
                }
            }
        );

    }

    /**
     * Converts the GraphModelRecord(s) (returned by getGraphModel() and expandGraphModelNode() services) into a list of nodes and links
     */
    private convertModelToGraph(graphModel: GraphModelRecord[]): { links: UmlLink[], nodes: UmlNode[] } {
        let links: UmlLink[] = [];
        let nodes: UmlNode[] = [];
        //set the nodes and the links according the model
        graphModel.forEach(record => {
            /**
             * Se abbiamo una property:
             * - che ha come dominio una classe definita dall'utente e come range OWL thing
             * - che ha come range un datatype e dominio! da OWL thing
             * aggiungiamo la property al nodo ma non creiamo il link
             */
            if (
                (!record.source.equals(OWL.thing) && record.target.equals(OWL.thing)) ||
                (record.target.getAdditionalProperty("isDatatype") && !record.source.equals(OWL.thing))
            ) {

                let node: UmlNode = nodes.find(n => n.res.equals(record.source));
                if (node == null) {
                    node = new UmlNode(record.source);
                    nodes.push(node);
                }
                node.listPropInfo.push(new PropInfo(record.link, record.target))
            } else // case domain!=thing   range!=thing and range!=datatype (vediamo sia nodo che link)
                if ((!record.target.getAdditionalProperty("isDatatype") &&
                    !record.source.equals(OWL.thing) &&
                    !record.target.equals(OWL.thing))
                    //|| (record.source.equals(OWL.thing) && !record.target.equals(OWL.thing))
                ) {
                    let nodeSource: UmlNode = nodes.find(n => n.res.equals(record.source));
                    let nodeTarget: UmlNode = nodes.find(n => n.res.equals(record.target));
                    if (nodeSource == null) {
                        nodeSource = new UmlNode(record.source);
                        nodes.push(nodeSource);
                    }
                    if (nodeTarget == null) {
                        nodeTarget = new UmlNode(record.target);
                        nodes.push(nodeTarget);
                    }
                    nodeSource.listPropInfo.push(new PropInfo(record.link, record.target));
                    links.push(new UmlLink(nodeSource, nodeTarget, record.link));
                }
            // let nodeSource: UmlNode = new UmlNode(record.source);
            // let nodeTarget: UmlNode = new UmlNode(record.target);
            // links.push(new UmlLink(nodeSource, nodeTarget, record.link));
        });
        links.forEach(l => {
            if (!l.res.equals(RDFS.subClassOf)) {
                this.linksCache.push(l);
            }
        })
        //this.debugCache();

        return { links: links, nodes: nodes };
    }

    /* ============== GLOBAL GRAPH MODEL ============== */

    private initGraph(graph: { links: UmlLink[], nodes: UmlNode[] }) {
        graph.nodes.forEach(n => {
            this.graph.addNode(n)
        })
        graph.links.forEach(l => {
            this.graph.addLink(l)
        })

        //console.log(graph)
        // links.forEach(l => {
        //     //update the source and target nodes of the link with the same nodes retrieved from the graph
        //     let sourceNode = this.retrieveNode(<UmlNode>l.source);
        //     l.source = sourceNode;
        //     let targetNode = this.retrieveNode(<UmlNode>l.target);
        //     l.target = targetNode;
        // });
        // links.forEach(l => {
        //     let prop = l.res;
        //     //if(prop.equals(RDFS.subClassOf)){return}
        //     let sourceNode = this.retrieveNode(<UmlNode>l.source);
        //     if (!sourceNode.listProperties.some(p => p.equals(prop))) {
        //         sourceNode.listProperties.push(prop);
        //     }
        // });
        // links.forEach(l => { this.graph.addLink(l) });
        this.graph.update();

    }




    /**
    * Returns the node, for the given resource, retrieved from the graph. If it doesn't yet exist, creates a new one and returns it.
    * If the node is rdfs:Literal creates a new one each time, since node describing this resource cannot be reused.
    * If the node is owl:Thing looks into the thingNodesMap far an owl:Thing node already used for the relatedRes.
    * In case returns it, otherwise creates a new one, update the map and returns it.
    */
    private retrieveNode(node: UmlNode): UmlNode {
        let graphNode: UmlNode;
        graphNode = <UmlNode>this.graph.getNode(node.res);
        if (graphNode == null) { //node for the given resource not yet created => create it and add to the graph
            graphNode = node;
            this.graph.addNode(graphNode);
        }

        return graphNode;
    }



    protected closeNode(node: Node) {

    }

    protected expandNode(node: Node, selectOnComplete?: boolean) {

    }



    protected onNodeDblClicked(node: UmlNode) {
        // if (!this.graph.dynamic) return; //if graph is not dynamic, do nothing
        // if (node.open) {
        //     this.closeNode(node);
        // } else {
        //     this.expandNode(node);
        // }
    }

    private onPropClicked(node: UmlNode, prop: PropInfo) {
        this.selectedProp = null;
        let linkClicked: Link;
        this.graph.getLinks().forEach(l => {
            if (l.source == node && l.res.equals(prop.property) && l.target.res.equals(prop.range)) {
                linkClicked = l
            }
        })
        if (linkClicked != null) {
            this.onLinkClicked(linkClicked)

        } else {
            this.selectedElement = null;
            this.linkAhead = null;
            this.elementSelected.emit(prop)
            this.selectedProp = { node: node, prop: prop };
        }

    }

    protected onLinkClicked(link: Link) {
        this.selectedProp = null;
        if (link == this.selectedElement) {
            this.selectedElement = null;
        } else {
            this.selectedElement = link;
        }
        this.linkAhead = <Link>this.selectedElement;
        this.elementSelected.emit(this.selectedElement);
        this.selectedProp = { node: (<UmlLink>link).source, prop: new PropInfo(link.res, <ARTURIResource>link.target.res) }
    };

    protected onNodeClicked(node: Node) {
        this.selectedProp = null;
        if (node == this.selectedElement) {
            this.selectedElement = null;
        } else {
            this.selectedElement = node;
        }
        this.activeRemove = true;
        this.linkAhead = null;
        this.elementSelected.emit(this.selectedElement);
    };


    /* ============== ACTIONS ============== */

    removeNode(node: UmlNode) {
        let linksToRemove: Link[] = this.graph.getLinksFrom(node);
        this.graph.getLinksTo(node).forEach(l => {
            //add only if not already in (if there are loops, the same link will be returned by getLinksFrom and getLinksTo)
            if (linksToRemove.indexOf(l) == -1) {
                linksToRemove.push(l);
            }
        })
        linksToRemove.forEach(l => {
            this.graph.removeLink(l);

        })
        this.linksCache.forEach((l,i,cache)=>{
            if (!l.res.equals(RDFS.subClassOf)) {
                console.log("sto rimuovendo dalla cache",l.getShow())
                cache.splice(i, 1);
            }

        })
        
        // console.log("links to remove", linksToRemove)
        console.log("cache after remove", this.linksCache)
        this.graph.removeNode(node)
        this.selectedElement = null;
        this.elementSelected.emit(this.selectedElement);
        this.graph.update();
    }


    addNode(res: ARTURIResource) {
        if (this.graph.getNode(res)) {
            this.basicModals.alert("Add node", "Cannot add a new node for " + res.getShow() + " since a node for the same resource already exists", "warning");
            return;
        }
        this.graphService.expandGraphModelNode(res).subscribe(
            (graphModel: GraphModelRecord[]) => {
                let graphTemp = this.convertModelToGraphForAddNode(graphModel, res);
                this.initGraph(graphTemp);
                if (this.hideArrow) {
                    graphTemp.links.forEach(l => {
                        this.graph.removeLink(l);
                    })
                }

            }
        );


    }

    /**
    * Converts the GraphModelRecord(s) (returned by  expandGraphModelNode() services) into the node to add and into the correct list of links to add
    */
    private convertModelToGraphForAddNode(graphModel: GraphModelRecord[], res: ARTURIResource): { links: UmlLink[], nodes: UmlNode[] } {
        let linksToAdd: UmlLink[] = [];
        let nodesToAdd: UmlNode[] = [];
        let nodeFound = new UmlNode(res);
        // imposto lo stesso valore fixed del primo nodo casuale che trovo nel grafo(sono o tutti fixed oppure no)
        nodeFound.fixed = this.graph.getNodes()[0].fixed
        nodeFound.x = 10
        nodeFound.y = 10

        graphModel.forEach(record => {

            //verifico le property da mettere dentro il nodo e i link da aggiungere 
            if (record.source.equals(res)) {
                nodeFound.listPropInfo.push(new PropInfo(record.link, record.target))
                let nodeTarget;
                if (record.target.equals(record.source)) {
                    nodeTarget = nodeFound;
                } else {
                    nodeTarget = this.graph.getNode(record.target)
                }
                if (nodeTarget != null) {
                    linksToAdd.push(new UmlLink(nodeFound, nodeTarget, record.link));
                }

            } else if (record.target.equals(res)) {
                let nodeSource = this.graph.getNode(record.source);
                if (nodeSource != null) {
                    linksToAdd.push(new UmlLink(nodeSource, nodeFound, record.link));
                }
            }
        });
        nodesToAdd.push(nodeFound)
        linksToAdd.forEach(l => {
            if (!l.res.equals(RDFS.subClassOf)) {
                console.log("linkADD-addCache", l.getShow())
                this.linksCache.push(l);

            }
        })
        //console.log("links  add", linksToAdd)
        console.log("cache after add", this.linksCache)
        return { links: linksToAdd, nodes: nodesToAdd };
    }


    private updateArrows() {
        // console.log("cache in update", this.linksCache)
        //console.log("sto in updateArrow", this.hideArrow)
        if (this.hideArrow === true) {
            console.log("nascondendo")
            this.linksCache.forEach(l => {
                this.graph.removeLink(l)
            })
        } else {
            console.log("mostrando", this.linksCache)
            this.linksCache.forEach(l => {
                this.graph.addLink(l)
            })
        }
        this.graph.update();
    }


    // debugCache(){
    //     this.linksCache.forEach(l=>{
    //         console.log(l.getShow());
    //     })
    // }


}