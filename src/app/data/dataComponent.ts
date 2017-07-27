import { Component, OnInit } from "@angular/core";
import { ARTResource, ARTURIResource } from "../models/ARTResources";
import { VBEventHandler } from "../utils/VBEventHandler";

@Component({
    selector: "data-component",
    templateUrl: "./dataComponent.html",
    host: { class: "pageComponent" },
})
export class DataComponent {

    private selectedResource: ARTResource; //this represent the selected resource in the tree (so it is for sure a URIResource)
    private sidebarFlex: number = 1;

    constructor(private eventHandler: VBEventHandler) { }

    private onNodeSelected(node: ARTResource) {
        /* Here emits an event in case the node selected is already selected in the tree.
        This event is required in order to resolve a minor bug that occured when using the tabbed resource view panel:
        when there are multiple tabs open and the active tab is not the first (which is the one in sync with the selected resource in the tree),
        if the user click again on the selected resource in the tree (in the attempt to activate the first tab), since the ngOnChanges
        in resourceViewTabbedComponent doesn't detect any change on the @Input resource, it doesn't activate the first tab
        */
        if (node == this.selectedResource) {
            this.eventHandler.resViewResyncEvent.emit(node);
        }
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