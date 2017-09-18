import { Component, ViewChild, Input, Output, EventEmitter } from "@angular/core";
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

    @Input() size: number;

    @Output() resize: EventEmitter<number> = new EventEmitter();

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
        if (this.size == 0) {
            this.setSize(3);
        }
    }

    deleteResource(res: ARTResource) {
        if (this.resViewMode == ResourceViewMode.splitted) {
            this.resViewSplittedChild.deleteResource(res);
        } else {
            this.resViewTabbedChild.deleteResource(res);
        }
    }

    //resizer handler

    private expandPanel() {
        if (this.size < 4) {
            this.setSize(this.size+1);
        }
    }

    private reducePanel() {
        if (this.size > 0) {
            this.setSize(this.size-1);
        }
    }

    private onTabEmpty() {
        this.setSize(0);
    }

    private setSize(size: number) {
        this.size = size;
        this.resize.emit(this.size);
    }

}