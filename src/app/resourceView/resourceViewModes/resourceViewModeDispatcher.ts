import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { ARTResource } from "../../models/ARTResources";
import { ResourceViewMode } from "../../models/Properties";
import { VBContext } from "../../utils/VBContext";
import { VBEventHandler } from "../../utils/VBEventHandler";
import { ResourceViewSplittedComponent } from "./resourceViewSplittedComponent";
import { ResourceViewTabbedComponent } from "./resourceViewTabbedComponent";

@Component({
    selector: "resource-view-mode-dispatcher",
    templateUrl: "./resourceViewModeDispatcher.html",
    host: { class: "vbox" }
})
export class ResourceViewModeDispatcher {

    @ViewChild(ResourceViewTabbedComponent) resViewTabbedChild: ResourceViewTabbedComponent;
    @ViewChild(ResourceViewSplittedComponent) resViewSplittedChild: ResourceViewSplittedComponent;

    @Output() empty: EventEmitter<number> = new EventEmitter(); //used with tabbed RV when all tab are closed or in splitted RV when the main resource is deleted
    @Output() tabSelect: EventEmitter<ARTResource> = new EventEmitter(); //used only with resource view tabbed when a tab containing a concept is selected

    resViewMode: ResourceViewMode; //"splitted" or "tabbed";

    private eventSubscriptions: Subscription[] = [];

    constructor(private eventHandler: VBEventHandler) {
        this.eventHandler.resViewModeChangedEvent.subscribe(
            (event: { mode: ResourceViewMode, fromVbPref: boolean }) => { 
                /**
                 * The change event could be emitted from:
                 * - Vocbench Preferences page: in this case, since the mode change does not fire the update of the ResViewPanel view 
                 * (the view is not active in that moment), the change from a view to the other is not performed, so it is not possible
                 * to call .selectResource(...) for the proper AbstractResourceViewPanel (splitted or tabbed). So, simply reset the 
                 * selected resources
                 * - ResourceView Settings modal: update the view mode and select back the resource currently selected in the main tab/panel.
                 */
                if (event.fromVbPref) {
                    this.empty.emit();
                } else { //from ResourceView Settings modal
                    let resToRestore: ARTResource;
                    let newResViewMode: ResourceViewMode = event.mode;
                    if (newResViewMode == ResourceViewMode.splitted) { //changed from tabbed to splitted
                        resToRestore = this.resViewTabbedChild.getMainResource();
                    } else { //changed from splitted to tabbed
                        resToRestore = this.resViewSplittedChild.getMainResource();
                    }
                    this.resViewMode = newResViewMode;
                    //timeout in order to wait that the RVPanel is updated after the change of mode
                    setTimeout(() => { this.selectResource(resToRestore); });
                }
            }
        );
    }

    ngOnInit() {
        this.resViewMode = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.mode;
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach(s => s.unsubscribe());
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

    //when there is no more RV open
    private onEmpty() {
        this.empty.emit();
    }

}