import { Component } from "@angular/core";
import { ResourceViewMode } from "../models/Properties";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties } from "../utils/VBProperties";

@Component({
    selector: "res-view-pref",
    templateUrl: "./resourceViewPreferencesComponent.html"
})
export class ResourceViewPreferencesComponent {

    private resViewMode: ResourceViewMode;
    private resViewTabSync: boolean;

    private displayImg: boolean;

    constructor(private vbProp: VBProperties, private eventHandler: VBEventHandler) { }

    ngOnInit() {
        this.resViewMode = this.vbProp.getResourceViewMode();
        this.resViewTabSync = this.vbProp.getResourceViewTabSync();
        this.displayImg = this.vbProp.getResourceViewDisplayImg();
    }

    private onResViewModeChange() {
        this.vbProp.setResourceViewMode(this.resViewMode);
        this.eventHandler.resViewModeChangedEvent.emit({ mode: this.resViewMode, fromVbPref: true });
    }

    private onTabSyncChange() {
        this.vbProp.setResourceViewTabSync(this.resViewTabSync);
        this.eventHandler.resViewTabSyncChangedEvent.emit(this.resViewTabSync);
    }

    private onDisplayImgChange() {
        this.vbProp.setResourceViewDisplayImg(this.displayImg);
    }

}