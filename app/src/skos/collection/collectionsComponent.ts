import {Component} from "@angular/core";
import {Router} from '@angular/router-deprecated';
import {CollectionTreePanelComponent} from "./collectionTreePanel/collectionTreePanelComponent";
import {ResourceViewPanelComponent} from "../../resourceView/resourceViewPanel/resourceViewPanelComponent";
import {ARTResource, ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";

@Component({
    selector: "collection-component",
    templateUrl: "app/src/skos/collection/collectionsComponent.html",
    directives: [CollectionTreePanelComponent, ResourceViewPanelComponent],
    host: { class : "pageComponent" }
})
export class CollectionsComponent {

    private resource: ARTURIResource; //this represent the selected resource in the tree (so it is for sure a URIResource)
    
    constructor(private vbCtx: VocbenchCtx, private router: Router) {
        // navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        } else if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['Projects']);
        }
    }

    //EVENT LISTENERS 
    private onNodeSelected(node) {
        this.resource = node;
    }
    
}