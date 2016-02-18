import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";

@Component({
	selector: "property-tree-node",
	templateUrl: "app/src/tree/propertyTree/propertyTreeNodeComponent.html",
    directives: [RdfResourceComponent, PropertyTreeNodeComponent],
})
export class PropertyTreeNodeComponent {
	@Input() node:ARTURIResource;
    
    private eventSubscriptions = [];
    
    private subTreeStyle: string = "subTree subtreeClose"; //to change dynamically the subtree style (open/close) 
	
	constructor(private eventHandler:VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.subPropertyCreatedEvent.subscribe(
            data => this.onSubPropertyCreated(data.subProperty, data.superPropertyURI)));
        this.eventSubscriptions.push(eventHandler.propertyDeletedEvent.subscribe(propertyURI => this.onPropertyDeleted(propertyURI)));
        this.eventSubscriptions.push(eventHandler.superPropertyRemovedEvent.subscribe(
            data => this.onSuperPropertyRemoved(data.propertyURI, data.superPropertyURI)));
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    /**
 	 * Function called when "+" button is clicked.
 	 * Gets a node as parameter and retrieve with an http call the narrower of the node,
 	 * then expands the subtree div.
 	 */
    public expandNode() {
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
    private collapseNode() {
		this.node.setAdditionalProperty("open", false);
		//instead of removing node.children (that will cause an immediate/not-animated collapse of the div), simply collapse the div
        this.subTreeStyle = this.subTreeStyle.replace("Open", "Close");
    }
    
    /**
     * Called when a node in the tree is clicked. This function emit an event 
     */
    private selectNode() {
        this.eventHandler.propertyTreeNodeSelectedEvent.emit(this.node);
    }
    
    //EVENT LISTENERS
    
    private onPropertyDeleted(propertyURI: string) {
        var children = this.node.getAdditionalProperty("children");
        for (var i=0; i<children.length; i++) {
            if (children[i].getURI() == propertyURI) {
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
    
    private onSubPropertyCreated(subProperty: ARTURIResource, superPropertyURI: string) {
        //add the new property as children only if the parent is the current property
        if (this.node.getURI() == superPropertyURI) {
            this.node.getAdditionalProperty("children").push(subProperty);
            this.node.setAdditionalProperty("more", 1);
        }
    }
    
    private onSuperPropertyRemoved(propertyURI: string, superPropertyURI: string) {
        if (superPropertyURI == this.node.getURI()) {
            this.onPropertyDeleted(propertyURI);
        }
    }
	
}