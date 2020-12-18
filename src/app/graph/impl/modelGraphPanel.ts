import { Component, ViewChild } from "@angular/core";
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource, ResAttribute } from "../../models/ARTResources";
import { GraphClassAxiomFilter } from "../../models/Graphs";
import { OWL, RDFS } from "../../models/Vocabulary";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { AbstractGraphPanel } from "../abstractGraphPanel";
import { ModelGraphComponent } from "./modelGraphComponent";

@Component({
    selector: 'model-graph-panel',
    templateUrl: "./modelGraphPanel.html"
})
export class ModelGraphPanel extends AbstractGraphPanel {

    @ViewChild(ModelGraphComponent) viewChildGraph: ModelGraphComponent;

    axiomFilters: GraphClassAxiomFilter[] = [
        { property: OWL.complementOf, show: false },
        { property: OWL.disjointWith, show: false },
        { property: OWL.equivalentClass, show: false },
        { property: RDFS.subClassOf, show: true }
    ];
    
    constructor(basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        super(basicModals, browsingModals);
    }

    private onFilterChange(filter: GraphClassAxiomFilter) {
        this.viewChildGraph.applyFilter(filter);
    }

    addNode() {
        this.browsingModals.browseClassTree("Add node").then(
            (cls: ARTURIResource) => {
                if (!cls.getAdditionalProperty(ResAttribute.EXPLICIT)) {
                    this.basicModals.alert({key:"STATUS.WARNING"}, "Cannot add a new node for " + cls.getShow() + 
                        ". In the model-oriented graph you can only add resources locally defined.", ModalType.warning);
                    return;
                }
                this.viewChildGraph.addNode(cls);
            },
            () => {}
        )
    }

}