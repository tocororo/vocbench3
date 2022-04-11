import { Component } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: "sparql-component",
    templateUrl: "./sparqlComponent.html",
    host: { class: "pageComponent" },
    styles: [`
        .addQueryBtn {
            padding: 4px 8px;
            border: 1px solid #ddd;
            border-radius: 4px 4px 0px 0px;
            font-weight: bold;
            color: rgb(51, 122, 183);
            background-color: #eee;
            margin-bottom: -1px;
        }
    `]
})
export class SparqlComponent {

    tabs: Array<Tab> = [];
    tabLimit: number = 10;

    constructor(private translateService: TranslateService) { }

    ngOnInit() {
        this.addQueryTab();
    }

    //TAB HANDLER

    addQueryTab() {
        let currentActiveTab = this.getActiveTab();
        if (currentActiveTab != null) {
            currentActiveTab.active = false;
        }
        let tab = { active: true, name: null, type: TabType.query, saved: false };
        this.translateService.get("SPARQL.QUERY.UNNAMED_QUERY").subscribe(translation => { tab.name = translation; });
        this.tabs.push(tab);

    }

    addParameterizationTab() {
        let currentActiveTab = this.getActiveTab();
        if (currentActiveTab != null) {
            currentActiveTab.active = false;
        }
        let tab = { active: true, name: null, type: TabType.parameterization, saved: false };
        this.translateService.get("SPARQL.QUERY.UNNAMED_PARAMETERIZED_QUERY").subscribe(translation => { tab.name = translation; });
        this.tabs.push(tab);
    }

    private selectTab(t: Tab) {
        this.getActiveTab().active = false;
        t.active = true;
    }

    private closeTab(t: Tab) {
        let tabIdx = this.tabs.indexOf(t);
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
        return this.tabs.find(t => t.active);
    }

}

class Tab {
    active: boolean;
    name: string;
    type: TabType;
    saved: boolean;
}

enum TabType {
    query = "query",
    parameterization = "parameterization",
}