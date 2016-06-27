import {Component} from "@angular/core";
import {PropertyTreePanelComponent} from "./propertyTreePanel/propertyTreePanelComponent";
import {ResourceViewPanelComponent} from "../resourceView/resourceViewPanel/resourceViewPanelComponent";
import {ARTURIResource} from "../utils/ARTResources";

@Component({
    selector: "property-component",
    templateUrl: "app/src/property/propertyComponent.html",
    directives: [PropertyTreePanelComponent, ResourceViewPanelComponent],
    host: { class: "pageComponent" }
})
export class PropertyComponent {
    
    private resource:ARTURIResource;
    
    //EVENT LISTENERS 
    private onNodeSelected(node) {
        this.resource = node;
    }
}