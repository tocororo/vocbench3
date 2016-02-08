import {Component} from "angular2/core";
import {ClassTreePanelComponent} from "./classTreePanel/classTreePanelComponent";
import {ResourceViewComponent} from "../resourceView/resourceViewComponent";
import {ARTURIResource} from "../utils/ARTResources";
import {VBEventHandler} from "../utils/VBEventHandler";

@Component({
	selector: "class-component",
	templateUrl: "app/src/owl/classComponent.html",
	directives: [ClassTreePanelComponent, ResourceViewComponent]
})
export class ClassComponent {
    
    public resource:ARTURIResource;
    private eventSubscriptions = [];
    
    constructor(private eventHandler:VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.classTreeNodeSelectedEvent.subscribe(node => this.onNodeSelected(node)));
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    //EVENT LISTENERS 
    
    private onNodeSelected(node) {
        this.resource = node;
    }
    
}