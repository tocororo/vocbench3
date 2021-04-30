import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { InstanceListPreference, InstanceListVisualizationMode, VisualizationModeTranslation } from "../../../models/Properties";
import { VBContext } from "../../../utils/VBContext";
import { VBProperties } from "../../../utils/VBProperties";

@Component({
    selector: "instance-list-settings-modal",
    templateUrl: "./instanceListSettingsModal.html",
})
export class InstanceListSettingsModal {

    private pristineInstancePref: InstanceListPreference;

    visualization: InstanceListVisualizationMode;
    visualizationModes: { value: InstanceListVisualizationMode, labelTranslationKey: string }[] = [
        { value: InstanceListVisualizationMode.standard, labelTranslationKey: VisualizationModeTranslation.translationMap[InstanceListVisualizationMode.standard] },
        { value: InstanceListVisualizationMode.searchBased, labelTranslationKey: VisualizationModeTranslation.translationMap[InstanceListVisualizationMode.searchBased] }
    ]

    private safeToGoLimit: number;

    constructor(public activeModal: NgbActiveModal, private vbProp: VBProperties) {}

    ngOnInit() {
        let instanceListPref: InstanceListPreference = VBContext.getWorkingProjectCtx().getProjectPreferences().instanceListPreferences;
        this.pristineInstancePref = JSON.parse(JSON.stringify(instanceListPref));
        this.visualization = instanceListPref.visualization;
        this.safeToGoLimit = instanceListPref.safeToGoLimit;
    }

    ok() {
        let changed: boolean = this.pristineInstancePref.visualization != this.visualization ||
            this.pristineInstancePref.safeToGoLimit != this.safeToGoLimit;

        if (changed) {
            let instListPrefs: InstanceListPreference = new InstanceListPreference();
            instListPrefs.visualization = this.visualization;
            instListPrefs.safeToGoLimit = this.safeToGoLimit;
            this.vbProp.setInstanceListPreferences(instListPrefs);
            this.activeModal.close();
        } else {
            this.activeModal.close();
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

}