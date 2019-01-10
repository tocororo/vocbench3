import { Component, Input, ViewChild } from "@angular/core";
import { ARTResource } from "../models/ARTResources";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { GraphMode } from "./abstractGraph";
import { DataGraphComponent } from "./impl/dataGraphComponent";
import { ModelGraphComponent } from "./impl/modelGraphComponent";
import { ForceDirectedGraph, GraphForces } from "./model/ForceDirectedGraph";
import { Node } from "./model/Node";

@Component({
    selector: 'graph-panel',
    templateUrl: "./graphPanel.html"
})
export class GraphPanel {
    @Input() graph: ForceDirectedGraph;
    @Input() mode: GraphMode;
    @Input() rendering: boolean = true;

    @ViewChild(DataGraphComponent) viewChildDataGraph: DataGraphComponent;
    @ViewChild(ModelGraphComponent) viewChildModelGraph: ModelGraphComponent;

    private selectedNode: Node;
    private forces: GraphForces = new GraphForces();

    constructor(private sharedModals: SharedModalServices) { }

    private onForceChange() {
        if (this.mode == GraphMode.dataOriented) {
            this.viewChildDataGraph.updateForces(this.forces);
        } else {
            this.viewChildModelGraph.updateForces(this.forces);
        }
    }

    private showResourceView() {
        this.sharedModals.openResourceView(<ARTResource>this.selectedNode.res, false);
    }

    private fixNode() {
        this.selectedNode.fixed = !this.selectedNode.fixed;
        if (!this.selectedNode.fixed) {
            this.selectedNode.fx = null;
            this.selectedNode.fy = null;
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

    private onNodeSelected(node: Node) {
        this.selectedNode = node;
    }
}