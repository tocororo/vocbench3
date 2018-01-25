import { Component, ViewChild, Output, EventEmitter } from "@angular/core";
import { ResourceViewTabbedComponent } from "./resourceViewTabbedComponent";
import { ResourceViewSplittedComponent } from "./resourceViewSplittedComponent";
import { ARTResource } from "../../models/ARTResources";
import { ResourceViewMode } from "../../models/Properties";
import { VBProperties } from "../../utils/VBProperties";
import { VBEventHandler } from "../../utils/VBEventHandler";

@Component({
    selector: "resource-view-panel",
    templateUrl: "./resourceViewPanelComponent.html"
})
export class ResourceViewPanelComponent {

    @ViewChild(ResourceViewTabbedComponent) resViewTabbedChild: ResourceViewTabbedComponent;
    @ViewChild(ResourceViewSplittedComponent) resViewSplittedChild: ResourceViewSplittedComponent;

    @Output() empty: EventEmitter<number> = new EventEmitter(); //used with tabbed RV when all tab are closed or in splitted RV when the main resource is deleted
    @Output() tabSelect: EventEmitter<ARTResource> = new EventEmitter(); //used only with resource view tabbed when a tab containing a concept is selected

    private resViewMode: ResourceViewMode; //"splitted" or "tabbed";

    private eventSubscriptions: any[] = [];

    constructor(private eventHandler: VBEventHandler, private preferences: VBProperties) {
        this.eventHandler.resViewModeChangedEvent.subscribe(
            (newResViewMode: ResourceViewMode) => { 
                let resToRestore: ARTResource;
                if (newResViewMode == ResourceViewMode.splitted) { //changed from tabbed to splitted
                    resToRestore = this.resViewTabbedChild.getMainResource();
                } else { //changed from splitted to tabbed
                    resToRestore = this.resViewSplittedChild.getMainResource();
                }
                this.resViewMode = newResViewMode;
                //timeout in order to wait that the RVPanel is updated after the change of mode
                setTimeout(() => { this.selectResource(resToRestore); });
            }
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
            this.empty.emit();
        } else {
            this.resViewTabbedChild.deleteResource(res);
        }
    }

    //handlers only for resource view in tabbed mode

    //when a tab describing a concept is selected
    private onTabSelected(resource: ARTResource) {
        this.tabSelect.emit(resource);
    }

    //when there is no more tab open
    private onTabEmpty() {
        this.empty.emit();
    }

}