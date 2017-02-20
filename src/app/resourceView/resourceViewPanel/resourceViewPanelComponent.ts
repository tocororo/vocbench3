import { Component, Input } from "@angular/core";
import { ARTResource } from "../../models/ARTResources";
import { ResourceViewMode } from "../../models/Preferences";
import { VBEventHandler } from "../../utils/VBEventHandler";
import { Cookie } from "../../utils/Cookie";

@Component({
    selector: "resource-view-panel",
    templateUrl: "./resourceViewPanelComponent.html"
})
export class ResourceViewPanelComponent {

    @Input() resource: ARTResource;

    private resViewMode: ResourceViewMode; //"splitted" or "tabbed";

    private eventSubscriptions: any[] = [];

    constructor(private eventHandler: VBEventHandler) {
        this.eventHandler.resViewModeChangedEvent.subscribe(
            (resViewMode: ResourceViewMode) => { this.resViewMode = resViewMode; }
        );
    }

    ngOnInit() {
        this.resViewMode = <ResourceViewMode>Cookie.getCookie(Cookie.VB_RESOURCE_VIEW_MODE);
        if (this.resViewMode != "splitted" && this.resViewMode != "tabbed") {
            this.resViewMode = "tabbed"; //default
        }
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

}