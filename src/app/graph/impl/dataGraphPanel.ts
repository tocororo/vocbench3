import { Component, ViewChild } from "@angular/core";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { AbstractGraphPanel } from "../abstractGraphPanel";
import { DataGraphComponent } from "./dataGraphComponent";

@Component({
    selector: 'data-graph-panel',
    templateUrl: "./dataGraphPanel.html"
})
export class DataGraphPanel extends AbstractGraphPanel {

    @ViewChild(DataGraphComponent) viewChildGraph: DataGraphComponent;

    constructor(basicModals: BasicModalServices) {
        super(basicModals);
    }

}