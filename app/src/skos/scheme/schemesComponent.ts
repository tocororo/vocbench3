import {Component} from "@angular/core";
import {Router} from '@angular/router-deprecated';
import {SchemeListPanelComponent} from "./schemeListPanel/schemeListPanelComponent";
import {ResourceViewTabComponent} from "../../resourceView/resourceViewPanel/resourceViewTabComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from '../../utils/VocbenchCtx';

@Component({
    selector: "scheme-component",
    templateUrl: "app/src/skos/scheme/schemesComponent.html",
    directives: [SchemeListPanelComponent, ResourceViewTabComponent],
    host: { class: "pageComponent" }
})
export class SchemesComponent {
    
    public resource:ARTURIResource;
    
    constructor(private vbCtx: VocbenchCtx, private router: Router) {
        // navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        } else if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['Projects']);
        }
    }
    
    //EVENT LISTENERS 
    private onSchemeSelected(node) {
        this.resource = node;
    }
    
}