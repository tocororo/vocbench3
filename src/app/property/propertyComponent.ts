import {Component} from "@angular/core";
import {ARTURIResource} from "../utils/ARTResources";

@Component({
    selector: "property-component",
    templateUrl: "./propertyComponent.html",
    host: { class: "pageComponent" }
})
export class PropertyComponent {
    
    private resource:ARTURIResource;
    
    //EVENT LISTENERS 
    private onNodeSelected(node) {
        this.resource = node;
    }
}