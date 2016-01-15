import {Component} from "angular2/core";
import {PropertyTreePanelComponent} from "./propertyTreePanel/propertyTreePanelComponent";

@Component({
	selector: "property-component",
	templateUrl: "app/src/property/propertyComponent.html",
	directives: [PropertyTreePanelComponent]
})
export class PropertyComponent {
    
	constructor() {}
    
}