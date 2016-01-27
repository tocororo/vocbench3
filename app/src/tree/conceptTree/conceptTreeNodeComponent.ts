import {Component, Input} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {Deserializer} from "../../utils/Deserializer";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {SkosServices} from "../../services/skosServices";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";

@Component({
	selector: "concept-tree-node",
	templateUrl: "app/src/tree/conceptTree/conceptTreeNodeComponent.html",
    directives: [RdfResourceComponent, ConceptTreeNodeComponent],
    providers: [SkosServices],
})
export class ConceptTreeNodeComponent {
    @Input() node: ARTURIResource;
    @Input() scheme: ARTURIResource;
    
    private subscrConcDeleted;
    private subscrNarrowerCreated;
    public subTreeStyle: string = "subTree subtreeClose"; //to change dynamically the subtree style (subtreeOpen/Close) 
	
	constructor(private skosService:SkosServices, private deserializer:Deserializer, private eventHandler:VBEventHandler) {
        this.subscrConcDeleted = eventHandler.conceptDeletedEvent.subscribe(concept => this.onConceptDeleted(concept));
        this.subscrNarrowerCreated = eventHandler.narrowerCreatedEvent.subscribe(data => this.onNarrowerCreated(data));
    }
    
    ngOnDestroy() {
        this.subscrConcDeleted.unsubscribe();
        this.subscrNarrowerCreated.unsubscribe();
    }
    
    /**
 	 * Function called when "+" button is clicked.
 	 * Gets a node as parameter and retrieve with an http call the narrower of the node,
 	 * then expands the subtree div.
 	 */
    public expandNode() {
        if (this.node.getAdditionalProperty("more") == 1) { //if node has children
       		var schemeUri = null; //no scheme mode
    	    if (this.scheme != undefined) {
    	    	schemeUri = this.scheme.getURI();
    	    }
    		this.skosService.getNarrowerConcepts(this.node.getURI(), schemeUri)
                .subscribe(
                    stResp => {
                        var narrower = this.deserializer.createRDFArray(stResp);
                        for (var i=0; i<narrower.length; i++) {
                            narrower[i].setAdditionalProperty("children", []);
                        }
                        this.node.setAdditionalProperty("children", narrower); //append the retrieved node as child of the expanded node
                        //change the class of the subTree div from subtreeClose to subtreeOpen
                        this.subTreeStyle = this.subTreeStyle.replace("Close", "Open");
                    },
                    err => alert("Error: " + err)
                );
            this.node.setAdditionalProperty("open", true);
        }
    }
    
    /**
   	 * Function called when "-" button is clicked.
   	 * Collapse the subtree div.
   	 */
    public collapseNode() {
		this.node.setAdditionalProperty("open", false);
		//instead of removing node.children (that will cause an immediate/not-animated collapse of the div), simply collapse the div
        this.subTreeStyle = this.subTreeStyle.replace("Open", "Close");
    }
    
    /**
     * Called when a node in the tree is clicked. This function emit an event 
     */
    public selectNode() {
        this.eventHandler.conceptTreeNodeSelectedEvent.emit(this.node);
    }
    
    //EVENT LISTENERS
    
    private onConceptDeleted(concept:ARTURIResource) {
        var children = this.node.getAdditionalProperty("children");
        for (var i=0; i<children.length; i++) {
            if (children[i].getURI() == concept.getURI()) {
                children.splice(i, 1);
                //if node has no more children change info of node so the UI will update
   				if (children.length == 0) {
   					this.node.setAdditionalProperty("more", 0);
   					this.node.setAdditionalProperty("open", false);
   				}
                break;
            }
        }
    }
    
    //data contains "resource" and "parent"
    private onNarrowerCreated(data) {
        //add the new concept as children only if the parent is the current concept
        if (this.node.getURI() == data.parent.getURI()) {
            this.node.getAdditionalProperty("children").push(data.resource);
            this.node.setAdditionalProperty("more", 1);
        }
    }
    
}