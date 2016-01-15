import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {Deserializer} from "../../utils/Deserializer";
import {OwlServices} from "../../services/owlServices";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";

@Component({
	selector: "class-tree-node",
	templateUrl: "app/src/tree/classTree/classTreeNodeComponent.html",
    directives: [RdfResourceComponent, ClassTreeNodeComponent],
    providers: [OwlServices, Deserializer],
})
export class ClassTreeNodeComponent {
	@Input() node:ARTURIResource;
    // @Output() nodeSelevtedEvent:EventEmitter<ARTURIResource> = new EventEmitter();
    
    subTreeStyle: string = "subTree subtreeClose"; //to change dynamically the subtree style (open/close) 
	
	constructor(private owlService:OwlServices, public deserializer:Deserializer) {}
    
    /**
	 * Function called when "+" button is clicked.
	 * Gets a node as parameter and retrieve with an http call the subClass of the node,
	 * then expands the subtree div.
	 */
    expandNode() {
        if (this.node.getAdditionalProperty("more") == 1) { //if node has children
    		this.owlService.getSubClasses(this.node.getURI())
                .subscribe(
                    stResp => {
                        var subClasses = this.deserializer.createRDFArray(stResp);
                        for (var i=0; i<subClasses.length; i++) {
                            subClasses[i].setAdditionalProperty("children", []);
                        }
                        this.node.setAdditionalProperty("children", subClasses); //append the retrieved node as child of the expanded node
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