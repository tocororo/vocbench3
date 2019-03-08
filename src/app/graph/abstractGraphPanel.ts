import { Input } from "@angular/core";
import { ARTResource } from "../models/ARTResources";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { AbstractGraph } from "./abstractGraph";
import { ForceDirectedGraph, GraphForces } from "./model/ForceDirectedGraph";
import { Link } from "./model/Link";
import { Node } from "./model/Node";

export abstract class AbstractGraphPanel {
    @Input() graph: ForceDirectedGraph;
    @Input() rendering: boolean = true;

    abstract viewChildGraph: AbstractGraph;

    private selectedElement: Node | Link;
    // private forces: GraphForces = new GraphForces();
    private forces: GraphForces;

    constructor(private sharedModals: SharedModalServices, private basicModals: BasicModalServices) {
        this.forces = new GraphForces();
    }

    private onForceChange() {
        this.viewChildGraph.updateForces(this.forces);
    }

    private isSelectedElementNode() {
        return (this.selectedElement != null && this.selectedElement instanceof Node);
    }

    private showResourceView() {
        this.sharedModals.openResourceView(<ARTResource>this.selectedElement.res, false);
    }

    private fixNode() {
        let selectedNode = <Node>this.selectedElement;
        selectedNode.fixed = !selectedNode.fixed;
        if (!selectedNode.fixed) {
            selectedNode.fx = null;
            selectedNode.fy = null;
        }
    }
    private fixAll() {
        this.graph.nodes.forEach(n => {
            n.fixed = true;
            n.fx = n.x;
            n.fy = n.y;
        });
    }
    private unfixAll() {
        this.graph.nodes.forEach(n => {
            n.fixed = false;
            n.fx = null;
            n.fy = null;
        });
    }

    private onElementSelected(element: Node | Link) {
        this.selectedElement = element;
    }

    private snapshot() {
        let exportUrl = this.viewChildGraph.getExportUrl();
        this.basicModals.downloadLink("Export Graph SVG", null, exportUrl, "graph.svg");
    }

}