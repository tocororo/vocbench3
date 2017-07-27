import { Component, Input, SimpleChanges } from "@angular/core";
import { ARTResource, ResAttribute } from "../../models/ARTResources";
import { VBEventHandler } from "../../utils/VBEventHandler";

@Component({
    selector: "resource-view-tabbed",
    templateUrl: "./resourceViewTabbedComponent.html",
})
export class ResourceViewTabbedComponent {

    @Input() resource: ARTResource;

    private tabs: Array<Tab> = [];

    private eventSubscriptions: any[] = [];

    constructor(private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.resViewResyncEvent.subscribe(
            (res: ARTResource) => this.selectTab(this.tabs[0])));
    }

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

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
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
        //add a new first tab with the resource
        this.tabs.unshift({
            resource: resource,
            active: true
        });
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
     * Move an existing open tab to the first position as set as active.
     * This differs from setFirstTab that create a new tab (loading or reloading a resource view).
     */
    private moveToFirst(tab: Tab) {
        //deactivate the previous active tab
        this.deactivateCurrentActiveTab();
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