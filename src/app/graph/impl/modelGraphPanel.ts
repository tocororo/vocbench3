import { Component, ViewChild } from "@angular/core";
import { GraphClassAxiomFilter } from "../../models/Graphs";
import { OWL, RDFS } from "../../models/Vocabulary";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { AbstractGraphPanel } from "../abstractGraphPanel";
import { ModelGraphComponent } from "./modelGraphComponent";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";

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
    
    constructor(basicModals: BasicModalServices, private browsingModals: BrowsingModalServices) {
        super(basicModals);
    }

    private onFilterChange(filter: GraphClassAxiomFilter) {
        this.viewChildGraph.applyFilter(filter);
    }

    private add() {
        this.browsingModals.browseClassTree("Add resource").then(
            cls => {
                console.log("adding", cls);
                this.viewChildGraph.add(cls);
            },
            () => {}
        )
    }

}