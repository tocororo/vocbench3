import {Component} from "angular2/core";
import {PropertyTreePanelComponent} from "./propertyTreePanel/propertyTreePanelComponent";
import {ResourceViewComponent} from "../resourceView/resourceViewComponent";
import {ARTURIResource} from "../utils/ARTResources";

@Component({
	selector: "property-component",
	templateUrl: "app/src/property/propertyComponent.html",
	directives: [PropertyTreePanelComponent, ResourceViewComponent]
})
export class PropertyComponent {
    
    public resource:ARTURIResource;
    
	constructor() {}
    
    //EVENT LISTENERS 
    private onNodeSelected(node) {
        this.resource = node;
    }
}