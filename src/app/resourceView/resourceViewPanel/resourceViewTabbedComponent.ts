import { Component, Input, SimpleChanges } from "@angular/core";
import { ARTResource, ResAttribute } from "../../models/ARTResources";

@Component({
    selector: "resource-view-tabbed",
    templateUrl: "./resourceViewTabbedComponent.html",
})
export class ResourceViewTabbedComponent {

    @Input() resource: ARTResource;

    private tabs: Array<Tab> = [];
    // private activeTab: Tab;

    constructor() { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource']) {
            var res: ARTResource = changes['resource'].currentValue;
            var tab = this.getTabWithResource(res);
            if (tab != null) {//resource already open in a tab => moves it as first tab
                this.moveToFirst(tab);
            } else {
                this.setFirstTab(res);
            }
        }
    }

    private objectDblClick(obj: ARTResource) {
        var tab = this.getTabWithResource(obj);
        if (tab != null) { //object already open in a tab => select it
            this.selectTab(tab);
        } else {
            this.addTab(obj);
        }
    }

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

    //TAB HANDLER

    private setFirstTab(resource: ARTResource) {
        //deactivate the previous active tab
        this.deactivateCurrentActiveTab();
        //set as removable the previous first tab
        if (this.tabs.length > 0) {
            this.tabs[0].removable = true;
        }
        //add a new first tab with the resource
        this.tabs.unshift({
            resource: resource,
            removable: false,
            active: true
        });
    }

    private addTab(resource: ARTResource) {
        //deactivate the previous active tab
        this.deactivateCurrentActiveTab();
        this.tabs.push({
            resource: resource,
            removable: true,
            active: true
        });
    }

    /**
     * Move an existing open tab to the first position as set as active.
     * This differs from setFirstTab that create a new tab (loading or reloading a resource view).
     */
    private moveToFirst(tab: Tab) {
        //deactivate the previous active tab
        this.deactivateCurrentActiveTab();
        //set as removable the previous first tab (the one that will be shifted to 2nd position)
        if (this.tabs.length > 0) {
            this.tabs[0].removable = true;
        }
        this.closeTab(tab); //close the tab that will be moved in 1st position
        tab.active = true; //active tab
        this.tabs.unshift(tab); //and insert at first position

    }

    private selectTab(t: Tab) {
        //deactivate the previous active tab
        this.deactivateCurrentActiveTab();
        t.active = true;
    }

    private closeTab(t: Tab) {
        var tabIdx = this.tabs.indexOf(t);
        //if the closed tab is active and not the only open, change the active tab
        if (t.active && this.tabs.length > 1) {
            if (tabIdx == this.tabs.length - 1) { //if the closed tab was the last one, active the previous
                this.tabs[tabIdx - 1].active = true;
            } else { //otherwise active the next
                this.tabs[tabIdx + 1].active = true;
            }
        }
        this.tabs.splice(tabIdx, 1);
    }

    /**
     * Close all tabs (except the first in synch with the tree) and update active tab
     */
    private closeAllTabs() {
        this.tabs.splice(1);
        this.tabs[0].active = true;
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
     * NB this udpate affects also the resource in the tree (since resource stored the object passed from the tree)
     */
    private onResourceUpdate(resource: ARTResource) {
        for (var i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i].resource.getNominalValue() == resource.getNominalValue()) {
                this.tabs[i].resource[ResAttribute.SHOW] = resource.getShow();
                this.tabs[i].resource[ResAttribute.ROLE] = resource.getRole();
            }
        }
    }

}

class Tab {
    resource: ARTResource;
    removable: boolean;
    active: boolean;
}