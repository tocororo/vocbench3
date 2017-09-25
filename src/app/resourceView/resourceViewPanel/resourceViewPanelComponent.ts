import { Component, ViewChild, Output, EventEmitter } from "@angular/core";
import { ResourceViewTabbedComponent } from "./resourceViewTabbedComponent";
import { ResourceViewSplittedComponent } from "./resourceViewSplittedComponent";
import { ARTResource } from "../../models/ARTResources";
import { VBProperties, ResourceViewMode } from "../../utils/VBProperties";
import { VBEventHandler } from "../../utils/VBEventHandler";

@Component({
    selector: "resource-view-panel",
    templateUrl: "./resourceViewPanelComponent.html"
})
export class ResourceViewPanelComponent {

    @ViewChild(ResourceViewTabbedComponent) resViewTabbedChild: ResourceViewTabbedComponent;
    @ViewChild(ResourceViewSplittedComponent) resViewSplittedChild: ResourceViewSplittedComponent;

    @Output() empty: EventEmitter<number> = new EventEmitter(); //currently used only with resource view tabbed when all tab are closed

    private resViewMode: ResourceViewMode; //"splitted" or "tabbed";

    private eventSubscriptions: any[] = [];

    constructor(private eventHandler: VBEventHandler, private preferences: VBProperties) {
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

    selectResource(res: ARTResource) {
        if (this.resViewMode == ResourceViewMode.splitted) {
            this.resViewSplittedChild.selectResource(res);
        } else {
            this.resViewTabbedChild.selectResource(res);
        }
    }

    deleteResource(res: ARTResource) {
        if (this.resViewMode == ResourceViewMode.splitted) {
            this.resViewSplittedChild.deleteResource(res);
        } else {
            this.resViewTabbedChild.deleteResource(res);
        }
    }

    private onTabEmpty() {
        this.empty.emit();
    }

}