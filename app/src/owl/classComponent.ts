import {Component} from "angular2/core";
import {ClassTreePanelComponent} from "./classTreePanel/classTreePanelComponent";
import {ResourceViewComponent} from "../resourceView/resourceViewComponent";
import {ARTURIResource} from "../utils/ARTResources";

@Component({
	selector: "class-component",
	templateUrl: "app/src/owl/classComponent.html",
	directives: [ClassTreePanelComponent, ResourceViewComponent]
})
export class ClassComponent {
    
    public resource:ARTURIResource;
    
    constructor() {}
    
    //EVENT LISTENERS 
    private onNodeSelected(node) {
        this.resource = node;
    }
    
}