import {Component, OnInit} from "angular2/core";
import {ConceptTreePanelComponent} from "./conceptTreePanel/conceptTreePanelComponent";
import {ResourceViewComponent} from "../../resourceView/resourceViewComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {VBEventHandler} from "../../utils/VBEventHandler";

@Component({
	selector: "concepts-component",
	templateUrl: "app/src/skos/concept/conceptsComponent.html",
	directives: [ConceptTreePanelComponent, ResourceViewComponent]
})
export class ConceptsComponent implements OnInit {
    
    public scheme:ARTURIResource;
    public resource:ARTURIResource;
    private eventSubscriptions = [];
    
	constructor(public vbCtx:VocbenchCtx, private eventHandler:VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.conceptTreeNodeSelectedEvent.subscribe(node => this.onNodeSelected(node)));
    }
    
    ngOnInit() {
        this.scheme = this.vbCtx.getScheme();
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    //EVENT LISTENERS 
    
    private onNodeSelected(node) {
        this.resource = node;
    }
    
}