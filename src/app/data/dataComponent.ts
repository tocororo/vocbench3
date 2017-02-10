import {Component, OnInit} from "@angular/core";
import {ARTResource, ARTURIResource} from "../models/ARTResources";
import {VocbenchCtx} from "../utils/VocbenchCtx";

@Component({
    selector: "data-component",
    templateUrl: "./dataComponent.html",
    host: { class : "pageComponent" },
    styles: ['.largeSidebar { flex: 2; }'] //double size of sidebar when expanded
})
export class DataComponent {

    private selectedResource: ARTResource; //this represent the selected resource in the tree (so it is for sure a URIResource)
    private sidebarStatus: number = 1; //available values: 0 (hidden sidebar), 1 (default size), 2 (double size)
    
    constructor(private vbCtx: VocbenchCtx) {}

    private onNodeSelected(node: ARTResource) {
        this.selectedResource = node;
    }

    private reduceSidebar() {
        if (this.sidebarStatus > 0) {
            this.sidebarStatus--;
        }
    }

    private expandSidebar() {
        if (this.sidebarStatus < 2) {
            this.sidebarStatus++;
        }
    }

}