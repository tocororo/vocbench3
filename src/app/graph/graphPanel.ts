import { Component, Input, ViewChild } from "@angular/core";
import { ARTResource } from "../models/ARTResources";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { GraphMode } from "./abstractGraph";
import { DataGraphComponent } from "./impl/dataGraphComponent";
import { ModelGraphComponent } from "./impl/modelGraphComponent";
import { ForceDirectedGraph, GraphForces } from "./model/ForceDirectedGraph";
import { Link } from "./model/Link";
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

    private selectedElement: Node | Link;
    private forces: GraphForces = new GraphForces();

    constructor(private sharedModals: SharedModalServices, private basicModals: BasicModalServices) { }

    private onForceChange() {
        if (this.mode == GraphMode.dataOriented) {
            this.viewChildDataGraph.updateForces(this.forces);
        } else {
            this.viewChildModelGraph.updateForces(this.forces);
        }
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
        let exportUrl;
        if (this.mode == GraphMode.dataOriented) {
            exportUrl = this.viewChildDataGraph.getExportUrl();
        } else {
            exportUrl = this.viewChildModelGraph.getExportUrl();
        }
        this.basicModals.downloadLink("Export Graph SVG", null, exportUrl, "graph.svg");
    }
}