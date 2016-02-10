import {Component, ViewChild} from "angular2/core";
import {ConceptSchemePanelComponent} from "./conceptSchemePanel/conceptSchemePanelComponent";
import {ResourceViewComponent} from "../../resourceView/resourceViewComponent";
import {ARTURIResource} from "../../utils/ARTResources";

@Component({
	selector: "scheme-component",
	templateUrl: "app/src/skos/scheme/schemesComponent.html",
	directives: [ConceptSchemePanelComponent, ResourceViewComponent],
})
export class SchemesComponent {
    
    public resource:ARTURIResource;
    
    constructor() {}
    
    //EVENT LISTENERS 
    private onSchemeSelected(node) {
        this.resource = node;
    }
    
}