import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {PropertyTreePanelComponent} from "./propertyTreePanel/propertyTreePanelComponent";
import {ResourceViewPanelComponent} from "../resourceView/resourceViewPanel/resourceViewPanelComponent";
import {ARTURIResource} from "../utils/ARTResources";
import {VocbenchCtx} from "../utils/VocbenchCtx";

@Component({
    selector: "property-component",
    templateUrl: "app/src/property/propertyComponent.html",
    directives: [PropertyTreePanelComponent, ResourceViewPanelComponent],
    host: { class: "pageComponent" }
})
export class PropertyComponent {
    
    private resource:ARTURIResource;
    
	constructor(private vbCtx: VocbenchCtx, private router: Router) {
        if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['/Projects']);
        }
    }
    
    //EVENT LISTENERS 
    private onNodeSelected(node) {
        this.resource = node;
    }
}