import {Component} from "angular2/core";
import {Router} from 'angular2/router';
import {ConceptSchemePanelComponent} from "./conceptSchemePanel/conceptSchemePanelComponent";
import {ResourceViewComponent} from "../../resourceView/resourceViewComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from '../../utils/VocbenchCtx';

@Component({
	selector: "scheme-component",
	templateUrl: "app/src/skos/scheme/schemesComponent.html",
	directives: [ConceptSchemePanelComponent, ResourceViewComponent],
})
export class SchemesComponent {
    
    public resource:ARTURIResource;
    
    constructor(private vbCtx: VocbenchCtx, private router: Router) {
        //navigate to Projects view if a project is not selected
        if (vbCtx.getProject() == "SYSTEM") {
            router.navigate(['Projects']);
        }
    }
    
    //EVENT LISTENERS 
    private onSchemeSelected(node) {
        this.resource = node;
    }
    
}