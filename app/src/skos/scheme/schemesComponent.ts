import {Component} from "angular2/core";
import {Router} from 'angular2/router';
import {SchemeListPanelComponent} from "./schemeListPanel/schemeListPanelComponent";
import {ResourceViewComponent} from "../../resourceView/resourceViewComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from '../../utils/VocbenchCtx';

@Component({
    selector: "scheme-component",
    templateUrl: "app/src/skos/scheme/schemesComponent.html",
    directives: [SchemeListPanelComponent, ResourceViewComponent],
    host: { class: "pageComponent" }
})
export class SchemesComponent {
    
    public resource:ARTURIResource;
    
    constructor(private vbCtx: VocbenchCtx, private router: Router) {
        // navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        }
        //navigate to Projects view if a project is not selected
        if (vbCtx.getWorkingProject() == undefined) {
            router.navigate(['Projects']);
        }
    }
    
    //EVENT LISTENERS 
    private onSchemeSelected(node) {
        this.resource = node;
    }
    
}