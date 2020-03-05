import { Component, EventEmitter, Output } from "@angular/core";
import { ARTResource } from "../../models/ARTResources";
import { VBEventHandler } from "../../utils/VBEventHandler";
import { VBProperties } from "../../utils/VBProperties";
import { AbstractResourceViewPanel } from "./abstractResourceViewPanel";

@Component({
    selector: "resource-view-tabbed",
    templateUrl: "./resourceViewTabbedComponent.html",
    host: { class: "vbox" }
})
export class ResourceViewTabbedComponent extends AbstractResourceViewPanel {

    private tabs: Array<Tab> = [];
    private sync: boolean = false;

    //emits event when a tab is selected, useful to keep in sync tabbed ResView and trees/lists
    @Output() tabSelect: EventEmitter<ARTResource> = new EventEmitter();

    constructor(private vbProps: VBProperties, eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventHandler.resViewTabSyncChangedEvent.subscribe(
            (sync: boolean) => { this.sync = sync; }
        );
    }

    ngOnInit() {
        this.sync = this.vbProps.getResourceViewTabSync();
    }

    selectResource(resource: ARTResource) {
        let tab = this.getTabWithResource(resource);
        if (tab != null) { //resource already open in a tab => select it
            this.selectTab(tab)
        } else { //resource not yet open in a tab => open it
            this.addTab(resource);
        }
    }

    deleteResource(resource: ARTResource) {
        let tab = this.getTabWithResource(resource);
        if (tab != null) {
            this.closeTab(tab);
        }
    }

    /**
     * Returns the resource described in the currently active tab (null if no tab is open)
     * Useful for the ResourceViewPanel in order to keep a resource when the RViewMode changes
     */
    getMainResource(): ARTResource {
        let activeTabRes: ARTResource = null;
        for (var i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i].active) {
                activeTabRes = this.tabs[i].resource;
                break;
            }
        }
        return activeTabRes;
    }

    objectDblClick(obj: ARTResource) {
        var tab = this.getTabWithResource(obj);
        if (tab != null) { //object already open in a tab => select it
            this.selectTab(tab, true);
        } else {
            this.addTab(obj);
        }
    }

    //TAB HANDLER

    /**
     * Returns the tab where the given resource is described.
     * If none tab describes that resource, returns null
     */
    private getTabWithResource(res: ARTResource) {
        for (var i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i].resource.getNominalValue() == res.getNominalValue()) {
                return this.tabs[i];
            }
        }
        return null;
    }

    private addTab(resource: ARTResource) {
        //deactivate the previous active tab
        this.deactivateCurrentActiveTab();
        this.tabs.push({
            resource: resource,
            active: true
        });
    }

    /**
     * Select and activate a tab
     * @param t 
     * @param emitSelect if true emits a select event
     */
    private selectTab(t: Tab, emitSelect?: boolean) {
        //deactivate the previous active tab
        this.deactivateCurrentActiveTab();
        t.active = true;
        if (this.sync && emitSelect) {
            this.tabSelect.emit(t.resource);
        }
    }

    private closeTab(t: Tab) {
        let tabIdx = this.tabs.indexOf(t);
        //if the closed tab is active and not the only open, change the active tab
        if (t.active && this.tabs.length > 1) {
            if (tabIdx == this.tabs.length - 1) { //if the closed tab was the last one, active the previous
                this.selectTab(this.tabs[tabIdx-1], true);
            } else { //otherwise active the next
                this.selectTab(this.tabs[tabIdx+1], true);
            }
        }
        this.tabs.splice(tabIdx, 1);
        if (this.tabs.length == 0) {
            this.empty.emit();
        }
    }

    /**
     * Close all tabs
     */
    private closeAllTabs() {
        this.tabs = [];
        this.empty.emit();
    }

    private deactivateCurrentActiveTab() {
        for (var i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i].active) {
                this.tabs[i].active = false;
            }
        }
    }

    /**
     * When changes on resource view make change the show of the resource, update the resource of the tab
     * so that the header of the tab shows the updated resource.
     */
    private onResourceUpdate(resource: ARTResource, tab: Tab) {
        /**
         * here I copy the attributes of the resource, instead of replacing the resource, so that I prevent
         * that the resource-view component detectes the change of the input [resource] and makes starting
         * a loop (resource updated -> getResourceView() -> response parsed and resource in RV updated -> resource updated -> ...)
         */
        // let props: string[] = Object.getOwnPropertyNames(resource);
        // for (var i = 0; i < props.length; i++) {
        //     tab.resource[props[i]] = resource[props[i]];
        // }

        // Solved the previous problem simply cheching in ngOnChanges of ResourceView if the nominalValue of the resource has changed
        tab.resource = resource;
    }

    onRefreshDataBroadcast() {
        this.closeAllTabs();
    }

}

class Tab {
    resource: ARTResource;
    active: boolean;
}