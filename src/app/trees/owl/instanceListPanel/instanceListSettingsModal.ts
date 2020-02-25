import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { InstanceListPreference, InstanceListVisualizationMode } from "../../../models/Properties";
import { VBContext } from "../../../utils/VBContext";
import { VBProperties } from "../../../utils/VBProperties";

@Component({
    selector: "instance-list-settings-modal",
    templateUrl: "./instanceListSettingsModal.html",
})
export class InstanceListSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private pristineInstancePref: InstanceListPreference;

    private visualization: InstanceListVisualizationMode;
    private visualizationModes: { label: string, value: InstanceListVisualizationMode }[] = [
        { label: "Standard", value: InstanceListVisualizationMode.standard },
        { label: "Search based", value: InstanceListVisualizationMode.searchBased }
    ]

    constructor(public dialog: DialogRef<BSModalContext>, private vbProp: VBProperties) {
        this.context = dialog.context;
    }

    ngOnInit() {
        let instanceListPref: InstanceListPreference = VBContext.getWorkingProjectCtx().getProjectPreferences().instanceListPreferences;
        this.pristineInstancePref = JSON.parse(JSON.stringify(instanceListPref));
        this.visualization = instanceListPref.visualization;
    }

    ok(event: Event) {
        if (this.pristineInstancePref.visualization != this.visualization) {
            this.vbProp.setInstanceListVisualization(this.visualization);
        }
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }

}