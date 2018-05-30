import { Component } from "@angular/core";

@Component({
    selector: "sparql-component",
    templateUrl: "./sparqlComponent.html",
    host: { class: "pageComponent" },
})
export class SparqlComponent {

    private tabs: Array<Tab> = [];

    constructor() { }

    ngOnInit() {
        this.addTab();
    }

    //TAB HANDLER

    addTab() {
        let currentActiveTab = this.getActiveTab();
        if (currentActiveTab != null) {
            currentActiveTab.active = false;
        }
        this.tabs.push({
            active: true
        });
    }

    selectTab(t: Tab) {
        this.getActiveTab().active = false;
        t.active = true;
    }

    closeTab(t: Tab) {
        var tabIdx = this.tabs.indexOf(t);
        //if the closed tab is active, change the active tab (only if it wasn't the only open tab)
        if (t.active && this.tabs.length > 1) {
            if (tabIdx == this.tabs.length - 1) { //if the closed tab was the last one, active the previous
                this.tabs[tabIdx - 1].active = true;
            } else { //otherwise active the next
                this.tabs[tabIdx + 1].active = true;
            }
        }
        this.tabs.splice(tabIdx, 1);
    }

    private getActiveTab(): Tab {
        for (var i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i].active) {
                return this.tabs[i];
            }
        }
    }

}

class Tab {
    active: boolean;
}