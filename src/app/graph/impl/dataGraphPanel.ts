import { Component, ViewChild } from "@angular/core";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { AbstractGraphPanel } from "../abstractGraphPanel";
import { DataGraphComponent } from "./dataGraphComponent";

@Component({
    selector: 'data-graph-panel',
    templateUrl: "./dataGraphPanel.html"
})
export class DataGraphPanel extends AbstractGraphPanel {

    @ViewChild(DataGraphComponent) viewChildGraph: DataGraphComponent;

    constructor(sharedModals: SharedModalServices, basicModals: BasicModalServices) {
        super(sharedModals, basicModals);
    }

}