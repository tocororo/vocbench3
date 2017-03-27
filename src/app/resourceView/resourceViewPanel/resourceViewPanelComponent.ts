import { Component, Input } from "@angular/core";
import { ARTResource } from "../../models/ARTResources";
import { VBPreferences, ResourceViewMode } from "../../utils/VBPreferences";
import { VBEventHandler } from "../../utils/VBEventHandler";

@Component({
    selector: "resource-view-panel",
    templateUrl: "./resourceViewPanelComponent.html"
})
export class ResourceViewPanelComponent {

    @Input() resource: ARTResource;

    private resViewMode: ResourceViewMode; //"splitted" or "tabbed";

    private eventSubscriptions: any[] = [];

    constructor(private eventHandler: VBEventHandler, private preferences: VBPreferences) {
        this.eventHandler.resViewModeChangedEvent.subscribe(
            (resViewMode: ResourceViewMode) => { this.resViewMode = resViewMode; }
        );
    }

    ngOnInit() {
        this.resViewMode = this.preferences.getResourceViewMode();
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

}