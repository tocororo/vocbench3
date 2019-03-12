import { Component, ViewChild } from "@angular/core";
import { Modal, OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder } from "ngx-modialog/plugins/bootstrap";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { AbstractGraphPanel } from "../abstractGraphPanel";
import { DataGraphSettingsModal } from "../modal/dataGraphSettingsModal";
import { DataGraphComponent } from "./dataGraphComponent";

@Component({
    selector: 'data-graph-panel',
    templateUrl: "./dataGraphPanel.html"
})
export class DataGraphPanel extends AbstractGraphPanel {

    @ViewChild(DataGraphComponent) viewChildGraph: DataGraphComponent;

    constructor(basicModals: BasicModalServices, private modal: Modal) {
        super(basicModals);
    }

    openSettings() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(DataGraphSettingsModal, overlayConfig).result;
    }

}