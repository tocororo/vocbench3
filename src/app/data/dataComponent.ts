import { Component, OnInit, ViewChild } from "@angular/core";
import { ResourceViewPanelComponent } from "../resourceView/resourceViewPanel/resourceViewPanelComponent";
import { ARTResource, ARTURIResource } from "../models/ARTResources";
import { VBEventHandler } from "../utils/VBEventHandler";

@Component({
    selector: "data-component",
    templateUrl: "./dataComponent.html",
    host: { class: "pageComponent" },
})
export class DataComponent {

    @ViewChild(ResourceViewPanelComponent) resViewPanelChild: ResourceViewPanelComponent;

    constructor(private eventHandler: VBEventHandler) { }

    private onNodeSelected(node: ARTResource) {
        this.resViewPanelChild.selectResource(node);
    }

    private onNodeDeleted(node: ARTResource) {
        this.resViewPanelChild.deleteResource(node);
    }


    private resViewPanelFlex: number = 0;
    private onResize(size: number) {
        this.resViewPanelFlex = size;
    }

}