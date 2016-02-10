import {Component, OnInit} from "angular2/core";
import {ConceptTreePanelComponent} from "./conceptTreePanel/conceptTreePanelComponent";
import {ResourceViewComponent} from "../../resourceView/resourceViewComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";

@Component({
	selector: "concept-component",
	templateUrl: "app/src/skos/concept/conceptsComponent.html",
	directives: [ConceptTreePanelComponent, ResourceViewComponent]
})
export class ConceptsComponent implements OnInit {
    
    public scheme:ARTURIResource;
    public resource:ARTURIResource;
    
	constructor(public vbCtx:VocbenchCtx) {}
    
    ngOnInit() {
        this.scheme = this.vbCtx.getScheme();
    }
    
    //EVENT LISTENERS 
    private onNodeSelected(node) {
        this.resource = node;
    }
    
}