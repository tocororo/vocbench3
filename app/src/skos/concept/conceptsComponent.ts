import {Component, OnInit} from "angular2/core";
import {Router} from 'angular2/router';
import {ConceptTreePanelComponent} from "./conceptTreePanel/conceptTreePanelComponent";
import {ResourceViewComponent} from "../../resourceView/resourceViewComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";

@Component({
    selector: "concept-component",
    templateUrl: "app/src/skos/concept/conceptsComponent.html",
    directives: [ConceptTreePanelComponent, ResourceViewComponent]
})
export class ConceptsComponent implements OnInit {

    private scheme: ARTURIResource;
    private resource: ARTURIResource;

    constructor(private vbCtx: VocbenchCtx, private router: Router) {
        //navigate to Projects view if a project is not selected
        if (vbCtx.getProject() == "SYSTEM") {
            router.navigate(['Projects']);
        }
    }

    ngOnInit() {
        this.scheme = this.vbCtx.getScheme();
    }
    
    //EVENT LISTENERS 
    private onNodeSelected(node) {
        this.resource = node;
    }

}