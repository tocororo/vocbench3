import {Component, Input, OnInit} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {Deserializer} from "../../utils/Deserializer";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {SkosServices} from "../../services/skosServices";
import {ConceptTreeNodeComponent} from "./conceptTreeNodeComponent";

@Component({
	selector: "concept-tree",
	templateUrl: "app/src/tree/conceptTree/conceptTreeComponent.html",
    directives: [ConceptTreeNodeComponent],
    providers: [SkosServices],
})
export class ConceptTreeComponent implements OnInit {
	@Input() scheme:ARTURIResource;
    public roots:ARTURIResource[];
    private selectedNode:ARTURIResource;
    
    private subscrNodeSelected;
    private subscrTopConcCreated;
    private subscrConcDeleted;
	
    constructor(private skosService:SkosServices, private deserializer:Deserializer, private eventHandler:VBEventHandler) {
        this.subscrNodeSelected = eventHandler.conceptTreeNodeSelectedEvent.subscribe(node => this.onConceptSelected(node));
        this.subscrTopConcCreated = eventHandler.topConceptCreatedEvent.subscribe(concept => this.onTopConceptCreated(concept));
        this.subscrConcDeleted = eventHandler.conceptDeletedEvent.subscribe(concept => this.onConceptDeleted(concept));
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
                },
                err => { 
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
    ngOnDestroy() {
        this.subscrNodeSelected.unsubscribe();
        this.subscrTopConcCreated.unsubscribe();
        this.subscrConcDeleted.unsubscribe();
    }
    
    //EVENT LISTENERS
    
    private onConceptSelected(node:ARTURIResource) {
        if (this.selectedNode == undefined) {
            this.selectedNode = node;
            this.selectedNode.setAdditionalProperty("selected", true);    
        } else if (this.selectedNode.getURI() != node.getURI()) {
            this.selectedNode.deleteAdditionalProperty("selected");
            this.selectedNode = node;
            this.selectedNode.setAdditionalProperty("selected", true);
        }
    }
    
    private onTopConceptCreated(concept:ARTURIResource) {
        this.roots.push(concept);
    }
    
    private onConceptDeleted(concept:ARTURIResource) {
        //check if the concept to delete is a root
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == concept.getURI()) {
                this.roots.splice(i, 1);
                break;
            }
        }
    }
    
}