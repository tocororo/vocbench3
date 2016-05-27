import {Component, OnInit} from "@angular/core";
import {Router} from '@angular/router-deprecated';
import {ConceptTreePanelComponent} from "./conceptTreePanel/conceptTreePanelComponent";
import {ResourceViewComponent} from "../../resourceView/resourceViewComponent";
import {ARTResource, ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";

@Component({
    selector: "concept-component",
    templateUrl: "app/src/skos/concept/conceptsComponent.html",
    directives: [ConceptTreePanelComponent, ResourceViewComponent],
    host: { class : "pageComponent" }
})
export class ConceptsComponent implements OnInit {

    private scheme: ARTURIResource;
    private resource: ARTURIResource; //this represent the selected resource in the tree (so it is for sure a URIResource)
    private object: ARTResource; //this represent the double clicked object in the main resource view (to show in the 2nd RV)

    constructor(private vbCtx: VocbenchCtx, private router: Router) {
        // navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        } else if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['Projects']);
        }
    }

    ngOnInit() {
        this.scheme = this.vbCtx.getScheme();
    }
    
    private closeSecondaryResView() {
        this.object = null;
    }
    
    private objectDblClick(obj: ARTResource) {
        this.object = obj;
    }
    
    //EVENT LISTENERS 
    private onNodeSelected(node) {
        this.resource = node;
    }
    
}