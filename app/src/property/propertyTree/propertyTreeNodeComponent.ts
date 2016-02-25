import {Component, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";

/**
 * Currently the propertyTree is built statically, that means the server provide to the client
 * all the hierarchy, and not like the conceptTree and classTree where the trees are built
 * dynamically starting from the roots and retrieving the children of a given node.
 * Given that, the code that opens a path in the tree (for the search function) doesn't require to wait for the
 * initalization of the children views (since they are already initialized at the initalization of the whole tree).
 * So, the code pieces that deals with this thing are commented at the moment. Once the property services will be
 * refactored, this code will be useful again and decommented.
 */

@Component({
	selector: "property-tree-node",
	templateUrl: "app/src/property/propertyTree/propertyTreeNodeComponent.html",
    directives: [RdfResourceComponent, PropertyTreeNodeComponent],
})
export class PropertyTreeNodeComponent {
	@Input() node:ARTURIResource;
    
    //get an element in the view referenced with #treeNodeElement (useful to apply scrollIntoView in the search function)
    @ViewChild('treeNodeElement') treeNodeElement;
    //PropertyTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(PropertyTreeNodeComponent) viewChildrenNode: QueryList<PropertyTreeNodeComponent>;
    //structure to support the tree opening
    // private pendingSearch = {
    //     pending: false, //tells if there is a pending search waiting that children view are initialized 
    //     path: [], //remaining path of the tree to open
    // }
    
    private eventSubscriptions = [];
    
    private subTreeStyle: string = "subTree subtreeClose"; //to change dynamically the subtree style (open/close) 
	
	constructor(private eventHandler:VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.subPropertyCreatedEvent.subscribe(
            data => this.onSubPropertyCreated(data.subProperty, data.superProperty)));
        this.eventSubscriptions.push(eventHandler.propertyDeletedEvent.subscribe(property => this.onPropertyDeleted(property.getURI())));
        this.eventSubscriptions.push(eventHandler.superPropertyRemovedEvent.subscribe(
            data => this.onSuperPropertyRemoved(data.propertyURI, data.superPropertyURI)));
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            data => this.onResourceRenamed(data.oldResource, data.newResource))); 
    }
    
    ngAfterViewInit() {
        //when ClassTreeNodeComponent children are added, looks for a pending search to resume
        // this.viewChildrenNode.changes.subscribe(
        //     c => {
        //         if (this.pendingSearch.pending) {//there is a pending search
        //             this.expandPath(this.pendingSearch.path);
        //         }
        //     });
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    /**
     * Expand recursively the given path untill the final node.
     * If the given path is empty then the current node is the searched one, otherwise
     * the current node expands itself (if is closed), looks among its children for the following node of the path,
     * then call recursively expandPath() for the child node.
     */
    public expandPath(path: ARTURIResource[]) {
        if (path.length == 0) { //this is the last node of the path. Focus it in the tree
            this.treeNodeElement.nativeElement.scrollIntoView();
            //not sure if it has to be selected (this method could be used in some scenarios where there's no need to select the node)
            //this.selectNode();
        } else {
            if (!this.node.getAdditionalProperty("open")) { //if node is close, expand itself
                this.expandNode();
            }
            var nodeChildren = this.viewChildrenNode.toArray();
            // if (nodeChildren.length == 0) {//Still no children ConceptTreeNodeComponent (view not yet initialized)
            //     //save pending search so it can resume when the children are initialized
            //     this.pendingSearch.pending = true;
            //     this.pendingSearch.path = path;
            // } else if (this.pendingSearch.pending) {
            //     //the tree expansion is resumed, reset the pending search
            //     this.pendingSearch.pending = false;
            //     this.pendingSearch.path = [];
            // }
            for (var i = 0; i < nodeChildren.length; i++) {//for every ConceptTreeNodeComponent child
                if (nodeChildren[i].node.getURI() == path[0].getURI()) { //look for the next node of the path
                    //let the child node expand the remaining path
                    path.splice(0, 1);
                    nodeChildren[i].expandPath(path);
                    break;
                }
            }
        }
    }
    
    /**
 	 * Function called when "+" button is clicked.
 	 * Gets a node as parameter and retrieve with an http call the narrower of the node,
 	 * then expands the subtree div.
 	 */
    public expandNode() {
        //change the class of the subTree div from subtreeClose to subtreeOpen
        this.subTreeStyle = "subTree subtreeOpen";
        this.node.setAdditionalProperty("open", true);
    }
    
    /**
   	 * Function called when "-" button is clicked.
   	 * Collapse the subtree div.
   	 */
    private collapseNode() {
		this.node.setAdditionalProperty("open", false);
        this.subTreeStyle = "subTree subtreeClose";
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
    
    private onSubPropertyCreated(subProperty: ARTURIResource, superProperty: ARTURIResource) {
        //add the new property as children only if the parent is the current property
        if (this.node.getURI() == superProperty.getURI()) {
            this.node.getAdditionalProperty("children").push(subProperty);
            this.node.setAdditionalProperty("more", 1);
        }
    }
    
    private onSuperPropertyRemoved(propertyURI: string, superPropertyURI: string) {
        if (superPropertyURI == this.node.getURI()) {
            this.onPropertyDeleted(propertyURI);
        }
    }
	
    private onResourceRenamed(oldResource: ARTURIResource, newResource: ARTURIResource) {
        if (oldResource.getURI() == this.node.getURI()) {
            this.node['show'] = newResource.getShow();
            this.node['uri'] = newResource.getURI();
        }
    }
    
}