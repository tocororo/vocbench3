import { Component, ViewChild } from "@angular/core";
import { GraphClassAxiomFilter } from "../../models/Graphs";
import { OWL, RDFS } from "../../models/Vocabulary";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { AbstractGraphPanel } from "../abstractGraphPanel";
import { ModelGraphComponent } from "./modelGraphComponent";

@Component({
    selector: 'model-graph-panel',
    templateUrl: "./modelGraphPanel.html"
})
export class ModelGraphPanel extends AbstractGraphPanel {

    @ViewChild(ModelGraphComponent) viewChildGraph: ModelGraphComponent;

    private axiomFilters: GraphClassAxiomFilter[] = [
        { property: OWL.complementOf, show: false },
        { property: OWL.disjointWith, show: false },
        { property: OWL.equivalentClass, show: false },
        { property: RDFS.subClassOf, show: true }
    ];
    
    constructor(basicModals: BasicModalServices) {
        super(basicModals);
    }

    private onFilterChange(filter: GraphClassAxiomFilter) {
        this.viewChildGraph.updateGraphFilter(filter);
    }

}