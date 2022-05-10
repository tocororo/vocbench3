import { Directive, Input } from "@angular/core";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../widget/modal/browsingModal/browsingModalServices";
import { AbstractGraph } from "./abstractGraph";
import { ForceDirectedGraph, GraphForces } from "./model/ForceDirectedGraph";
import { Link } from "./model/Link";
import { Node } from "./model/Node";

@Directive()
export abstract class AbstractGraphPanel {
    @Input() graph: ForceDirectedGraph;
    @Input() rendering: boolean = true;

    abstract viewChildGraph: AbstractGraph;

    selectedElement: Node | Link;
    isLock: boolean = false;
    forces: GraphForces;
    
    protected basicModals: BasicModalServices;
    protected browsingModals: BrowsingModalServices;
    constructor(basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        this.basicModals = basicModals;
        this.browsingModals = browsingModals;
        this.forces = new GraphForces();
    }

    abstract addNode(): void;

    onForceChange() {
        this.viewChildGraph.updateForces(this.forces);
    }

    isSelectedElementNode() {
        return (this.selectedElement != null && this.selectedElement instanceof Node);
    }

    private fixNode() {
        let selectedNode = <Node>this.selectedElement;
        selectedNode.fixed = !selectedNode.fixed;
        if (!selectedNode.fixed) {
            selectedNode.fx = null;
            selectedNode.fy = null;
        }

    }
    fixAll() {
        this.graph.getNodes().forEach(n => {
            n.fixed = true;
            n.fx = n.x;
            n.fy = n.y;
        });
        this.isLock = true;
    }
    unfixAll() {
        this.graph.getNodes().forEach(n => {
            n.fixed = false;
            n.fx = null;
            n.fy = null;
        });
        this.isLock = false;
    }

    onElementSelected(element: Node | Link) {
        this.selectedElement = element;
    }

    snapshot() {
        let exportUrl = this.viewChildGraph.getExportUrl();
        this.basicModals.downloadLink({ key: "GRAPHS.ACTIONS.EXPORT_GRAPH_SNAPSHOT" }, null, exportUrl, "graph.svg");
    }

}