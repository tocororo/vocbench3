import {Component, Input} from "angular2/core";
import {ConceptTreeComponent} from "../../tree/conceptTree/ConceptTreeComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {ROUTER_DIRECTIVES} from "angular2/router";

@Component({
	selector: "concept-tree-panel",
	templateUrl: "app/src/skos/conceptTreePanel/conceptTreePanelComponent.html",
	directives: [ConceptTreeComponent, ROUTER_DIRECTIVES] //ROUTER_DIRECTIVES for router_link in noScheme image button (check)
})
export class ConceptTreePanelComponent {
    @Input() scheme:ARTURIResource;
    private selectedConcept:ARTURIResource;
    
	constructor() {}
    
    createConcept() {
        alert("create concept");
    }
    
    /* the following methods still cannot be used 'cause to selectedConcept should be updated 
       through event emitted from. Need to understand how to emit/broadcast event in NG2 */ 
    createNarrower() {
        alert("create narrower of..." + JSON.stringify(this.selectedConcept));
    }
    
    deleteConcept() {
        alert("delete concept..." + JSON.stringify(this.selectedConcept));
    }
    
}