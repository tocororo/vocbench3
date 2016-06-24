import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {ConceptTreePanelComponent} from "./conceptTreePanel/conceptTreePanelComponent";
import {ResourceViewPanelComponent} from "../../resourceView/resourceViewPanel/resourceViewPanelComponent";
import {ARTResource, ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";

@Component({
    selector: "concept-component",
    templateUrl: "app/src/skos/concept/conceptsComponent.html",
    directives: [ConceptTreePanelComponent, ResourceViewPanelComponent],
    host: { class : "pageComponent" }
})
export class ConceptsComponent implements OnInit {

    private scheme: ARTURIResource;
    private resource: ARTURIResource; //this represent the selected resource in the tree (so it is for sure a URIResource)
    
    constructor(private vbCtx: VocbenchCtx, private router: Router) {
        if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['/Projects']);
        }
    }

    ngOnInit() {
        this.scheme = this.vbCtx.getScheme();
    }
    
    //EVENT LISTENERS 
    private onNodeSelected(node: ARTURIResource) {
        this.resource = node;
    }
    
}