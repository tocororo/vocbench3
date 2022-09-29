import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PartitionFilterPreference } from "../../models/Properties";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";

@Component({
    selector: "data-graph-settings-modal",
    templateUrl: "./dataGraphSettingsModal.html",
})
export class DataGraphSettingsModal {

    graphFilter: PartitionFilterPreference;

    hideLiteralNodes: boolean;

    constructor(public activeModal: NgbActiveModal, private vbProp: VBProperties) {
    }

    ngOnInit() {
        this.graphFilter = VBContext.getWorkingProjectCtx().getProjectPreferences().graphViewPartitionFilter;
        this.hideLiteralNodes = VBContext.getWorkingProjectCtx().getProjectPreferences().hideLiteralGraphNodes;
    }

    updateFilter() {
        this.vbProp.setGraphViewPartitionFilter(this.graphFilter).subscribe();
    }

    onHideLiteralChange() {
        this.vbProp.setHideLiteralGraphNodes(this.hideLiteralNodes).subscribe();
    }

    ok() {
        this.activeModal.close();
    }

}