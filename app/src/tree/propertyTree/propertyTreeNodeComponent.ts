import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";

@Component({
	selector: "property-tree-node",
	templateUrl: "app/src/tree/propertyTree/propertyTreeNodeComponent.html",
    directives: [RdfResourceComponent, PropertyTreeNodeComponent],
})
export class PropertyTreeNodeComponent {
	@Input() node:ARTURIResource;
    // @Output() nodeSelevtedEvent:EventEmitter<ARTURIResource> = new EventEmitter();
    
    subTreeStyle: string = "subTree subtreeClose"; //to change dynamically the subtree style (open/close) 
	
	constructor() {}
    
    /**
 	 * Function called when "+" button is clicked.
 	 * Gets a node as parameter and retrieve with an http call the narrower of the node,
 	 * then expands the subtree div.
 	 */
    expandNode() {
        if (this.node.getAdditionalProperty("children").length > 0) { //if node has children
            //change the class of the subTree div from subtreeClose to subtreeOpen
            this.subTreeStyle = this.subTreeStyle.replace("Close", "Open");
            this.node.setAdditionalProperty("open", true);
        }
    }
    
    /**
   	 * Function called when "-" button is clicked.
   	 * Collapse the subtree div.
   	 */
    collapseNode() {
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