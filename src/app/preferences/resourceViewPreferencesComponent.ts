import { Component } from "@angular/core";
import { ResourceViewMode } from "../models/Properties";
import { VBProperties } from "../utils/VBProperties";
import { VBEventHandler } from "../utils/VBEventHandler";

@Component({
    selector: "res-view-pref",
    templateUrl: "./resourceViewPreferencesComponent.html"
})
export class ResourceViewPreferencesComponent {

    private resViewMode: ResourceViewMode;
    private resViewTabSync: boolean;

    constructor(private vbProp: VBProperties, private eventHandler: VBEventHandler) { }

    ngOnInit() {
        this.resViewMode = this.vbProp.getResourceViewMode();
        this.resViewTabSync = this.vbProp.getResourceViewTabSync();
    }

    private onResViewModeChanged() {
        this.vbProp.setResourceViewMode(this.resViewMode);
        this.eventHandler.resViewModeChangedEvent.emit({ mode: this.resViewMode, fromVbPref: true });
    }

    private onTabSyncChange() {
        this.vbProp.setResourceViewTabSync(this.resViewTabSync);
        this.eventHandler.resViewTabSyncChangedEvent.emit(this.resViewTabSync);
    }

}