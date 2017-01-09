import {Component, OnInit} from "@angular/core";
import {ARTResource, ARTURIResource} from "../utils/ARTResources";
import {VocbenchCtx} from "../utils/VocbenchCtx";

@Component({
    selector: "data-component",
    templateUrl: "./dataComponent.html",
    host: { class : "pageComponent" }
})
export class DataComponent {

    private selectedResource: ARTResource; //this represent the selected resource in the tree (so it is for sure a URIResource)
    
    constructor(private vbCtx: VocbenchCtx) {}

    //EVENT LISTENERS 
    private onNodeSelected(node: ARTResource) {
        this.selectedResource = node;
    }

}