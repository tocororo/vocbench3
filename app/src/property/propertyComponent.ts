import {Component} from "angular2/core";
import {Router} from 'angular2/router';
import {PropertyTreePanelComponent} from "./propertyTreePanel/propertyTreePanelComponent";
import {ResourceViewComponent} from "../resourceView/resourceViewComponent";
import {ARTURIResource} from "../utils/ARTResources";
import {VocbenchCtx} from "../utils/VocbenchCtx";

@Component({
	selector: "property-component",
	templateUrl: "app/src/property/propertyComponent.html",
	directives: [PropertyTreePanelComponent, ResourceViewComponent]
})
export class PropertyComponent {
    
    private resource:ARTURIResource;
    
	constructor(private vbCtx: VocbenchCtx, private router: Router) {
        //navigate to Projects view if a project is not selected
        if (vbCtx.getProject() == "SYSTEM") {
            router.navigate(['Projects']);
        }
    }
    
    //EVENT LISTENERS 
    private onNodeSelected(node) {
        this.resource = node;
    }
}