import {Component, Input, OnInit} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {Deserializer} from "../../utils/Deserializer";
import {SkosServices} from "../../services/skosServices";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {ConceptTreeNodeComponent} from "./ConceptTreeNodeComponent";

@Component({
	selector: "concept-tree",
	templateUrl: "app/src/tree/conceptTree/conceptTreeComponent.html",
    directives: [ConceptTreeNodeComponent],
    providers: [SkosServices, Deserializer],
})
export class ConceptTreeComponent implements OnInit {
	@Input() scheme:ARTURIResource;
    public roots:ARTURIResource[];
    public selectedNode:ARTURIResource;
	
	constructor(private skosService:SkosServices, private deserializer:Deserializer, private eventHandler:VBEventHandler) {
        this.eventHandler.conceptTreeNodeSelectedEvent.subscribe(node => this.onConceptSelected(node));
        this.eventHandler.conceptCreatedEvent.subscribe(concept => this.onConceptCreated(concept));
        this.eventHandler.conceptDeletedEvent.subscribe(concept => this.onConceptDeleted(concept));
    }
    
    ngOnInit() {
        var schemeUri = null;
        if (this.scheme != undefined) {
            schemeUri = this.scheme.getURI();
        }
        this.skosService.getTopConcepts(schemeUri)
            .subscribe(
                stResp => {
                    this.roots = this.deserializer.createRDFArray(stResp);
                    for (var i=0; i<this.roots.length; i++) {
                        this.roots[i].setAdditionalProperty("children", []);
                    }
                }
            );
    }
    
    onConceptSelected(node:ARTURIResource) {
        if (this.selectedNode == undefined) {
            this.selectedNode = node;
            this.selectedNode.setAdditionalProperty("selected", true);    
        } else if (this.selectedNode.getURI() != node.getURI()) {
            this.selectedNode.deleteAdditionalProperty("selected");
            this.selectedNode = node;
            this.selectedNode.setAdditionalProperty("selected", true);
        }
        return true;
    }
    
    onConceptCreated(concept:ARTURIResource) {
        this.roots.push(concept);
    }
    
    onConceptDeleted(concept:ARTURIResource) {
        for (var i=0; i<this.roots.length; i++) {
            if (this.roots[i].getURI() == concept.getURI()) {
                this.roots.splice(i, 1);
                break;
            }
        }
    }
    
}