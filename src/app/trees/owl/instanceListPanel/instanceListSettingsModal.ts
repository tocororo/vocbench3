import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { InstanceListPreference, InstanceListVisualizationMode } from "../../../models/Properties";
import { VBContext } from "../../../utils/VBContext";
import { VBProperties } from "../../../utils/VBProperties";

@Component({
    selector: "instance-list-settings-modal",
    templateUrl: "./instanceListSettingsModal.html",
})
export class InstanceListSettingsModal {

    private pristineInstancePref: InstanceListPreference;

    visualization: InstanceListVisualizationMode;
    visualizationModes: { label: string, value: InstanceListVisualizationMode }[] = [
        { label: "Standard", value: InstanceListVisualizationMode.standard },
        { label: "Search based", value: InstanceListVisualizationMode.searchBased }
    ]

    constructor(public activeModal: NgbActiveModal, private vbProp: VBProperties) {}

    ngOnInit() {
        let instanceListPref: InstanceListPreference = VBContext.getWorkingProjectCtx().getProjectPreferences().instanceListPreferences;
        this.pristineInstancePref = JSON.parse(JSON.stringify(instanceListPref));
        this.visualization = instanceListPref.visualization;
    }

    ok() {
        if (this.pristineInstancePref.visualization != this.visualization) {
            this.vbProp.setInstanceListVisualization(this.visualization);
        }
        this.activeModal.close();
    }

    cancel() {
        this.activeModal.dismiss();
    }

}