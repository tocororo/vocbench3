import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {SchemeListPanelComponent} from "./schemeListPanel/schemeListPanelComponent";
import {ResourceViewPanelComponent} from "../../resourceView/resourceViewPanel/resourceViewPanelComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from '../../utils/VocbenchCtx';

@Component({
    selector: "scheme-component",
    templateUrl: "app/src/skos/scheme/schemesComponent.html",
    directives: [SchemeListPanelComponent, ResourceViewPanelComponent],
    host: { class: "pageComponent" }
})
export class SchemesComponent {
    
    public resource:ARTURIResource;
    
    constructor(private vbCtx: VocbenchCtx, private router: Router) {
        if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['/Projects']);
        }
    }
    
    //EVENT LISTENERS 
    private onSchemeSelected(node) {
        this.resource = node;
    }
    
}