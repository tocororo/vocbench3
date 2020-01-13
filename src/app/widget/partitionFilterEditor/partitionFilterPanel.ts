import { Component, Input } from "@angular/core";
import { PartitionFilterPreference } from "../../models/Properties";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";

@Component({
    selector: "partition-filter-panel",
    templateUrl: "./partitionFilterPanel.html"
})
export class PartitionFilterPanel {

    @Input() context: "Graph" | "ResourceView"; //specifies if the editor is dealing with the preference about the Graph or ResourceView

    private infoMsg: string;

    private pref: PartitionFilterPreference;

    constructor(private vbProp: VBProperties) {}

    ngOnInit() {
        if (this.context == "Graph") {
            this.infoMsg = "Select the partition of the resource description that will be shown when expanding a node.";
            this.pref = VBContext.getWorkingProjectCtx().getProjectPreferences().graphViewPartitionFilter;
        } else {
            this.infoMsg = "Here you can customize the ResourceView by showing/hiding the partitions.";
            this.pref = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPartitionFilter;
        }
    }



    private onFilterChange() {
        if (this.context == "Graph") {
            this.vbProp.setGraphViewPartitionFilter(this.pref);
        } else {
            this.vbProp.setResourceViewPartitionFilter(this.pref);
        }
    }

}
