import {Component, Input, ViewChildren, QueryList} from "angular2/core";
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
    
    //ConceptTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;
    //structure to support the tree opening
    private pendingSearch = {
        pending: false, //tells if there is a pending search waiting that children view are initialized 
        path: [], //remaining path of the tree to open
    }
    
    private eventSubscriptions = [];
    
    private subTreeStyle: string = "subTree subtreeClose"; //to change dynamically the subtree style (subtreeOpen/Close) 
	
	constructor(private skosService:SkosServices, private deserializer:Deserializer, private eventHandler:VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.conceptDeletedEvent.subscribe(concept => this.onConceptDeleted(concept)));
        this.eventSubscriptions.push(eventHandler.narrowerCreatedEvent.subscribe(data => this.onNarrowerCreated(data)));
        this.eventSubscriptions.push(eventHandler.conceptRemovedFromSchemeEvent.subscribe(
            data => this.onConceptRemovedFromScheme(data)));
        this.eventSubscriptions.push(eventHandler.broaderRemovedEvent.subscribe(data => this.onBroaderRemoved(data)));
    }
    
    ngAfterViewInit() {
        //when ConceptTreeNodeComponent children are added, looks for a pending search to resume
        this.viewChildrenNode.changes.subscribe(
            c => {
                if (this.pendingSearch.pending) {//there is a pending search
                    this.expandPath(this.pendingSearch.path);
                }
            });
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    /**
     * 
     */
    public expandPath(path: ARTURIResource[]) {
        if (path.length == 1) {//the last node (the one to reach) is child of this node
            return;
        }
        var nodeChildren = this.viewChildrenNode.toArray();
        if (nodeChildren.length == 0) {
            //Still no children ConceptTreeNodeComponent, save pending search so it can resume when the children are initialized
            this.pendingSearch.pending = true;
            this.pendingSearch.path = path;
        } else if (this.pendingSearch.pending) {
            //the tree expansion is resumed, reset the pending search
            this.pendingSearch.pending = false;
            this.pendingSearch.path = [];
        }
        for (var i = 0; i < nodeChildren.length; i++) {//for every ConceptTreeNodeComponent child
            if (nodeChildren[i].node.getURI() == path[0].getURI()) { //look for the one to expand
                if (!nodeChildren[i].node.getAdditionalProperty("open")) {
                    nodeChildren[i].expandNode(); //expand the ConceptTreeNodeComponent if is closed
                }
                //let the child node expand the remaining path
                path.splice(0, 1);
                nodeChildren[i].expandPath(path);
                break;
            }
        }
    }
    
    /**
 	 * Function called when "+" button is clicked.
 	 * Gets a node as parameter and retrieve with an http call the narrower of the node,
 	 * then expands the subtree div.
 	 */
    public expandNode() {
      	var schemeUri = null; //no scheme mode
        if (this.scheme != undefined) {
            schemeUri = this.scheme.getURI();
        }
        this.skosService.getNarrowerConcepts(this.node.getURI(), schemeUri).subscribe(
            stResp => {
                var narrower = this.deserializer.createRDFArray(stResp);
                for (var i = 0; i < narrower.length; i++) {
                    narrower[i].setAdditionalProperty("children", []);
                }
                this.node.setAdditionalProperty("children", narrower); //append the retrieved node as child of the expanded node
                //change the class of the subTree div from subtreeClose to subtreeOpen
                this.subTreeStyle = "subTree subtreeOpen";
                this.node.setAdditionalProperty("open", true);
            },
            err => {
                alert("Error: " + err);
                console.error(err.stack);
            });
    }
    
    /**
   	 * Function called when "-" button is clicked.
   	 * Collapse the subtree div.
   	 */
    private collapseNode() {
		this.node.setAdditionalProperty("open", false);
        this.subTreeStyle = "subTree subtreeClose";
        this.node.setAdditionalProperty("children", []);
    }
    
    /**
     * Called when a node in the tree is clicked. This function emit an event 
     */
    private selectNode() {
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
    
    //data contains "concept" and "scheme"
    private onConceptRemovedFromScheme(data) {
        var scheme = data.scheme;
        if (this.scheme != undefined && this.scheme.getURI() == scheme.getURI()) {
            var concept = data.concept;
            this.onConceptDeleted(concept);
        }
    }
    
    //data contains "resource" and "parent"
    private onBroaderRemoved(data) {
        var broader = data.parent;
        if (broader.getURI() == this.node.getURI()) {
            var concept = data.resource;
            this.onConceptDeleted(concept);
        }
    }
    
}