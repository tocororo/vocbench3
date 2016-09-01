import {Component, OnInit} from "@angular/core";
import {ARTResource, ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";

@Component({
    selector: "concept-component",
    templateUrl: "app/src/skos/concept/conceptsComponent.html",
    host: { class : "pageComponent" }
})
export class ConceptsComponent implements OnInit {

    private scheme: ARTURIResource;
    private resource: ARTURIResource; //this represent the selected resource in the tree (so it is for sure a URIResource)
    
    constructor(private vbCtx: VocbenchCtx) {}

    ngOnInit() {
        this.scheme = this.vbCtx.getScheme();
    }
    
    //EVENT LISTENERS 
    private onNodeSelected(node: ARTURIResource) {
        this.resource = node;
    }

}