import { Component, OnInit } from "@angular/core";
import { ARTResource, ARTURIResource } from "../models/ARTResources";

@Component({
    selector: "data-component",
    templateUrl: "./dataComponent.html",
    host: { class: "pageComponent" },
})
export class DataComponent {

    private selectedResource: ARTResource; //this represent the selected resource in the tree (so it is for sure a URIResource)
    private sidebarFlex: number = 1;

    constructor() { }

    private onNodeSelected(node: ARTResource) {
        this.selectedResource = node;
    }

    private reduceSidebar() {
        if (this.sidebarFlex > 0) {
            this.sidebarFlex--;
        }
    }

    private expandSidebar() {
        if (this.sidebarFlex < 3) {
            this.sidebarFlex++;
        }
    }

}