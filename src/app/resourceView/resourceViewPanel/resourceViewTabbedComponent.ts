import { Component, Output, EventEmitter } from "@angular/core";
import { ARTResource, ResAttribute } from "../../models/ARTResources";

@Component({
    selector: "resource-view-tabbed",
    templateUrl: "./resourceViewTabbedComponent.html",
})
export class ResourceViewTabbedComponent {

    private tabs: Array<Tab> = [];

    @Output() empty: EventEmitter<any> = new EventEmitter(); //tells to the parent component that there are no more tab open

    constructor() {}

    selectResource(resource: ARTResource) {
        // this.tabs = [];
        let tab = this.getTabWithResource(resource);
        if (tab != null) { //resource already open in a tab => select it
            this.selectTab(tab)
        } else { //resource not yet open in a tab => open it
            this.addTab(resource);
        }
    }

    deleteResource(resource: ARTResource) {
        let tab = this.getTabWithResource(resource);
        this.closeTab(tab);
    }

    private objectDblClick(obj: ARTResource) {
        var tab = this.getTabWithResource(obj);
        if (tab != null) { //object already open in a tab => select it
            this.selectTab(tab);
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

    private selectTab(t: Tab) {
        //deactivate the previous active tab
        this.deactivateCurrentActiveTab();
        t.active = true;
    }

    private closeTab(t: Tab, e?: Event) {
        let tabIdx = this.tabs.indexOf(t);
        //if the closed tab is active and not the only open, change the active tab
        if (t.active && this.tabs.length > 1) {
            if (tabIdx == this.tabs.length - 1) { //if the closed tab was the last one, active the previous
                this.tabs[tabIdx - 1].active = true;
            } else { //otherwise active the next
                this.tabs[tabIdx + 1].active = true;
            }
        }
        this.tabs.splice(tabIdx, 1);
        if (this.tabs.length == 0) {
            this.empty.emit();
        }
    }

    /**
     * Close all tabs (except the first in synch with the tree) and update active tab
     */
    private closeAllTabs(e: Event) {
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

}

class Tab {
    resource: ARTResource;
    active: boolean;
}