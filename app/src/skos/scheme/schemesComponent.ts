import {Component} from "angular2/core";
import {ConceptSchemePanelComponent} from "./conceptSchemePanel/conceptSchemePanelComponent";

@Component({
	selector: "scheme-component",
	templateUrl: "app/src/skos/scheme/schemesComponent.html",
	directives: [ConceptSchemePanelComponent],
})
export class SchemesComponent {
    
	constructor() {}
    
}