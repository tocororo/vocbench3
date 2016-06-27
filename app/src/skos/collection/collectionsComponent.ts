import {Component} from "@angular/core";
import {CollectionTreePanelComponent} from "./collectionTreePanel/collectionTreePanelComponent";
import {ResourceViewPanelComponent} from "../../resourceView/resourceViewPanel/resourceViewPanelComponent";
import {ARTResource, ARTURIResource} from "../../utils/ARTResources";

@Component({
    selector: "collection-component",
    templateUrl: "app/src/skos/collection/collectionsComponent.html",
    directives: [CollectionTreePanelComponent, ResourceViewPanelComponent],
    host: { class : "pageComponent" }
})
export class CollectionsComponent {

    private resource: ARTURIResource; //this represent the selected resource in the tree (so it is for sure a URIResource)
    
    //EVENT LISTENERS 
    private onNodeSelected(node) {
        this.resource = node;
    }
    
}