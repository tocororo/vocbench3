import { Component, Input, ViewChild } from "@angular/core";
import { ARTResource, ARTURIResource, ARTNode } from "../models/ARTResources";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { ForceDirectedGraph, GraphForces } from "./model/ForceDirectedGraph";
import { Node } from "./model/Node";
import { GraphMode } from "./abstractGraph";
import { ExplorationGraphComponent } from "./impl/explorationGraphComponent";

@Component({
    selector: 'graph-panel',
    templateUrl: "./graphPanel.html"
})
export class GraphPanel {
    @Input() graph: ForceDirectedGraph;
    @Input() mode: GraphMode;
    @Input() rendering: boolean = true;

    @ViewChild(ExplorationGraphComponent) viewChildGraph: ExplorationGraphComponent;

    private selectedNode: Node;

    private forces: GraphForces = new GraphForces();


    constructor(private sharedModals: SharedModalServices) { }

    ngOnInit() {
    }

    private onForceChange() {
        this.viewChildGraph.updateForces(this.forces);
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