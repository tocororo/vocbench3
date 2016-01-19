import {Component, Input} from "angular2/core";
import {ConceptTreeComponent} from "../../tree/conceptTree/conceptTreeComponent";
import {SkosServices} from "../../services/SkosServices";
import {ARTURIResource} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {Deserializer} from "../../utils/Deserializer";
import {ROUTER_DIRECTIVES} from "angular2/router";

@Component({
	selector: "concept-tree-panel",
	templateUrl: "app/src/skos/conceptTreePanel/conceptTreePanelComponent.html",
	directives: [ConceptTreeComponent, ROUTER_DIRECTIVES], //ROUTER_DIRECTIVES for router_link in noScheme image button (check)
    providers: [SkosServices, Deserializer]
})
export class ConceptTreePanelComponent {
    @Input() scheme:ARTURIResource;
    
    private selectedConcept:ARTURIResource;
    
	constructor(private skosService:SkosServices, private deserializer:Deserializer, private eventHandler:VBEventHandler) {
        eventHandler.conceptTreeNodeSelectedEvent.subscribe(node => this.onNodeSelected(node));
    }
    
    createConcept() {
        alert("create concept");
        this.skosService.createConcept("http://testConcept", "http://test.com#main", "mioConcetto", "en")
            .subscribe(
                stResp => {
                    var newConc = this.deserializer.createURI(stResp);
                    newConc.setAdditionalProperty("children", []);
                    this.eventHandler.conceptCreatedEvent.emit(newConc);
                }
            );
    }
    
    /* the following methods still cannot be used 'cause to selectedConcept should be updated 
       through event emitted from. Need to understand how to emit/broadcast event in NG2 */ 
    createNarrower() {
        alert("create narrower of..." + JSON.stringify(this.selectedConcept));
    }
    
    deleteConcept() {
        this.skosService.deleteConcept(this.selectedConcept.getURI())
            .subscribe(
                stResp => {
                    this.eventHandler.conceptDeletedEvent.emit(this.selectedConcept);
                }
            )
    }
    
    onNodeSelected(node:ARTURIResource) {
        this.selectedConcept = node;
    }
    
}