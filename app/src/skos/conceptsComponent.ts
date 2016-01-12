import {Component} from "angular2/core";
import {RdfResourceComponent} from "../widget/rdfResource/rdfResourceComponent";
import {ConceptTreeComponent} from "../tree/conceptTree/ConceptTreeComponent";
import {ARTNode, ARTURIResource} from "../utils/ARTResources";

@Component({
	selector: "concepts-component",
	templateUrl: "app/src/skos/conceptsComponent.html",
	directives: [RdfResourceComponent, ConceptTreeComponent]
})
export class ConceptsComponent {
    
    public res:ARTNode;
    
	constructor() {
    }
    
}