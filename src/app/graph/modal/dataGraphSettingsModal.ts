import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { PartitionFilterPreference } from "../../models/Properties";

@Component({
    selector: "data-graph-settings-modal",
    templateUrl: "./dataGraphSettingsModal.html",
})
export class DataGraphSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private graphFilter: PartitionFilterPreference;

    private hideLiteralNodes: boolean;

    constructor(public dialog: DialogRef<BSModalContext>, private vbProp: VBProperties) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.graphFilter = VBContext.getWorkingProjectCtx().getProjectPreferences().graphViewPartitionFilter;
        this.hideLiteralNodes = VBContext.getWorkingProjectCtx().getProjectPreferences().hideLiteralGraphNodes;
    }

    private updateFilter() {
        this.vbProp.setGraphViewPartitionFilter(this.graphFilter);
    }

    private onHideLiteralChange() {
        this.vbProp.setHideLiteralGraphNodes(this.hideLiteralNodes);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}