import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {OwlServices} from "../../services/owlServices";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";

@Component({
	selector: "class-tree-node",
	templateUrl: "app/src/tree/classTree/classTreeNodeComponent.html",
    directives: [RdfResourceComponent, ClassTreeNodeComponent],
    providers: [OwlServices],
})
export class ClassTreeNodeComponent {
	@Input() node:ARTURIResource;
    
    private eventSubscriptions = [];
    
    private subTreeStyle: string = "subTree subtreeClose"; //to change dynamically the subtree style (open/close) 
	
	constructor(private owlService:OwlServices, private eventHandler:VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.subClassCreatedEvent.subscribe(
            data => this.onSubClassCreated(data.subClass, data.superClassURI)));
        this.eventSubscriptions.push(eventHandler.classDeletedEvent.subscribe(classURI => this.onClassDeleted(classURI)));
        this.eventSubscriptions.push(eventHandler.subClassRemovedEvent.subscribe(
            data => this.onSubClassRemoved(data.classURI, data.subClassURI)));
    }
    
    ngOnInit() {
        if (this.node.getURI() == "http://www.w3.org/2002/07/owl#Thing") {
            this.expandNode();
        }
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    /**
	 * Function called when "+" button is clicked.
	 * Gets a node as parameter and retrieve with an http call the subClass of the node,
	 * then expands the subtree div.
	 */
    public expandNode() {
        if (this.node.getAdditionalProperty("more") == 1) { //if node has children
            this.owlService.getSubClasses(this.node.getURI()).subscribe(
                subClasses => {
                    this.node.setAdditionalProperty("children", subClasses); //append the retrieved node as child of the expanded node
                    //change the class of the subTree div from subtreeClose to subtreeOpen
                    this.subTreeStyle = this.subTreeStyle.replace("Close", "Open");
                    this.node.setAdditionalProperty("open", true);
                },
                err => {
                    alert("Error: " + err);
                    console.error(err['stack']);
                });
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
        this.eventHandler.classTreeNodeSelectedEvent.emit(this.node);
    }
    
    //EVENT LISTENERS
    
    private onClassDeleted(classURI: string) {
        var children = this.node.getAdditionalProperty("children");
        for (var i=0; i<children.length; i++) {
            if (children[i].getURI() == classURI) {
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
    
    private onSubClassCreated(subClass: ARTURIResource, superClassURI: string) {
        //add the new class as children only if the parent is the current class
        if (this.node.getURI() == superClassURI) {
            this.node.getAdditionalProperty("children").push(subClass);
            this.node.setAdditionalProperty("more", 1);
        }
    }
    
    private onSubClassRemoved(classURI: string, subClassURI: string) {
        if (classURI == this.node.getURI()) {
            this.onClassDeleted(subClassURI);
        }
    }
	
}