import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {Deserializer} from "../../utils/Deserializer";
import {SkosServices} from "../../services/skosServices";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";

@Component({
	selector: "concept-tree-node",
	templateUrl: "app/src/tree/conceptTree/conceptTreeNodeComponent.html",
    directives: [RdfResourceComponent, ConceptTreeNodeComponent],
    providers: [SkosServices, Deserializer],
})
export class ConceptTreeNodeComponent {
	@Input() node:ARTURIResource;
    @Input() scheme:ARTURIResource;
    // @Output() nodeSelevtedEvent:EventEmitter<ARTURIResource> = new EventEmitter();
    
    subTreeStyle: string = "subTree subtreeClose"; //to change dynamically the subtree style (open/close) 
	
	constructor(private skosService:SkosServices, public deserializer:Deserializer) {}
    
    /**
 	 * Function called when "+" button is clicked.
 	 * Gets a node as parameter and retrieve with an http call the narrower of the node,
 	 * then expands the subtree div.
 	 */
    expandNode() {
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
                        console.log("Child of " + this.node.getShow() + " " + JSON.stringify(this.node.getAdditionalProperty("children")));
                        //change the class of the subTree div from subtreeClose to subtreeOpen
                        this.subTreeStyle = this.subTreeStyle.replace("Close", "Open");
                    }
                );
            this.node.setAdditionalProperty("open", true);
        }
    }
    
    /**
   	 * Function called when "-" button is clicked.
   	 * Collapse the subtree div.
   	 */
    collapseNode() {
        // var subTreeDiv = $element[0].querySelector(".subTree");
		this.node.setAdditionalProperty("open", false);
		//instead of removing node.children (that will cause an immediate/not-animated collapse of the div), simply collapse the div
        this.subTreeStyle = this.subTreeStyle.replace("Open", "Close");
    }
    
    /**
     * Called when a node in the tree is clicked. This function emit an event 
     */
    selectNode() {
        console.log("node " + this.node.getShow() + " selected");
        // this.nodeSelevtedEvent.emit("nodeSelevtedEvent", this.node);
    }
	
}