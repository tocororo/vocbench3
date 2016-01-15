import {Component} from "angular2/core";
import {ConceptSchemePanelComponent} from "./conceptSchemePanel/conceptSchemePanelComponent";

@Component({
	selector: "schemes-component",
	templateUrl: "app/src/skos/scheme/schemesComponent.html",
	directives: [ConceptSchemePanelComponent],
})
export class SchemesComponent {
    
	constructor() {}
    
}