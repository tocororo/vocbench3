import {Component} from "angular2/core";
import {PropertyTreePanelComponent} from "./propertyTreePanel/propertyTreePanelComponent";
import {ResourceViewComponent} from "../resourceView/resourceViewComponent";
import {ARTURIResource} from "../utils/ARTResources";
import {VBEventHandler} from "../utils/VBEventHandler";

@Component({
	selector: "property-component",
	templateUrl: "app/src/property/propertyComponent.html",
	directives: [PropertyTreePanelComponent, ResourceViewComponent]
})
export class PropertyComponent {
    
    public resource:ARTURIResource;
    private eventSubscriptions = [];
    
	constructor(private eventHandler:VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.propertyTreeNodeSelectedEvent.subscribe(node => this.onNodeSelected(node)));
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    //EVENT LISTENERS 
    
    private onNodeSelected(node) {
        this.resource = node;
    }
}