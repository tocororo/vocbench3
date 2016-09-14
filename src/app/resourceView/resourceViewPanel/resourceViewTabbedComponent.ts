import {Component, Input} from "@angular/core";
import {ARTResource} from "../../utils/ARTResources";

@Component({
    selector: "resource-view-tabbed",
    templateUrl: "./resourceViewTabbedComponent.html",
})
export class ResourceViewTabbedComponent {
    
    @Input() resource: ARTResource;
    
    private tabs: Array<any> = [];
    private activeTab;
    
    constructor() {}
    
    ngOnChanges(changes) {
        if (changes.resource) {
            var res: ARTResource = changes.resource.currentValue;
            var tab = this.getTabWithResource(res);
            if (tab != null) {//resource already open in a tab => moves it as first tab
                this.closeTab(tab);
                this.setFirstTab(res);
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
        //deactivate the previous tab
        if (this.activeTab != null) {
            this.activeTab.active = false;
        }
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
        this.activeTab = this.tabs[0];
    }
    
    private addTab(resource: ARTResource) {
        //deactivate the previous tab
        if (this.activeTab != null) {
            this.activeTab.active = false;
        }
        this.tabs.push({
            resource: resource,
            removable: true,
            active: true
        });
        this.activeTab = this.tabs[this.tabs.length-1];
    }
    
    private selectTab(t) {
        this.activeTab.active = false;
        t.active = true;
        this.activeTab = t;
    }
    
    private closeTab(t) {
        var tabIdx = this.tabs.indexOf(t);
        //if the closed tab is active and not the only one, change the active tab
        if (t.active && this.tabs.length > 1) {
            if (tabIdx == this.tabs.length-1) { //if the closed tab was the last one, active the previous
                this.tabs[tabIdx-1].active = true;
                this.activeTab = this.tabs[tabIdx-1];
            } else { //otherwise active the next
                this.tabs[tabIdx+1].active = true;
                this.activeTab = this.tabs[tabIdx+1];
            }
        }
        this.tabs.splice(tabIdx, 1);
    }
    
}