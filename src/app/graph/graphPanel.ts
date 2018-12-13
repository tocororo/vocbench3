import { Component, Input } from "@angular/core";
import { ARTResource, ARTURIResource, ARTNode } from "../models/ARTResources";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { ForceDirectedGraph } from "./model/ForceDirectedGraph";
import { Node } from "./model/Node";
import { GraphMode } from "./abstractGraph";

@Component({
    selector: 'graph-panel',
    templateUrl: "./graphPanel.html"
})
export class GraphPanel {
    @Input() graph: ForceDirectedGraph;
    @Input() mode: GraphMode;
    @Input() rendering: boolean = true;

    private selectedNode: ARTNode;

    constructor(private sharedModals: SharedModalServices) { }

    ngOnInit() {
    }

    private showResourceView() {
        this.sharedModals.openResourceView(<ARTResource>this.selectedNode, false);
    }

    private onNodeSelected(node: Node) {
        this.selectedNode = <ARTResource>node.res;
    }
}