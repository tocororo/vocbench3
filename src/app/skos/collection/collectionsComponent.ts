import {Component} from "@angular/core";
import {ARTResource, ARTURIResource} from "../../utils/ARTResources";

@Component({
    selector: "collection-component",
    templateUrl: "./collectionsComponent.html",
    host: { class : "pageComponent" }
})
export class CollectionsComponent {

    private resource: ARTResource;
    
    //EVENT LISTENERS 
    private onNodeSelected(node: ARTResource) {
        this.resource = node;
    }
    
}