import {Component, Input, ViewChildren, ViewChild, QueryList} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
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
    
    //get an element in the view referenced with #treeNodeElement (useful to apply scrollIntoView in the search function)
    @ViewChild('treeNodeElement') treeNodeElement;
    //ConceptTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;
    //structure to support the tree opening
    private pendingSearch = {
        pending: false, //tells if there is a pending search waiting that children view are initialized 
        path: [], //remaining path of the tree to open
    }
    
    private eventSubscriptions = [];
    
    private subTreeStyle: string = "subTree subtreeClose"; //to change dynamically the subtree style (subtreeOpen/Close) 
	
	constructor(private skosService:SkosServices, private eventHandler:VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.conceptDeletedEvent.subscribe(
            deletedConceptURI => this.onConceptDeleted(deletedConceptURI)));
        this.eventSubscriptions.push(eventHandler.narrowerCreatedEvent.subscribe(
            data => this.onNarrowerCreated(data.narrower, data.broaderURI)));
        this.eventSubscriptions.push(eventHandler.conceptRemovedFromSchemeEvent.subscribe(
            data => this.onConceptRemovedFromScheme(data.conceptURI, data.schemeURI)));
        this.eventSubscriptions.push(eventHandler.broaderRemovedEvent.subscribe(
            data => this.onBroaderRemoved(data.conceptURI, data.broaderURI)));
        console.log("adding resourceRenamedEvent to eventSubscriptions");
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            data => {
                if (data.oldResourceURI == this.node.getURI()) {
                    console.log("In " + this.node.getURI() + " detected resource renamed in " + data.newResourceURI);
                    // console.log(JSON.stringify(this.node));
                    // this.node = new ARTURIResource(data.newResourceURI, this.node.getShow(), this.node.getRole());
                    // this.node.setAdditionalProperty("explicit", this.node.getAdditionalProperty("explicit"));
                    // this.node.setAdditionalProperty("children", this.node.getAdditionalProperty("children"));
                    // this.node.setAdditionalProperty("more", this.node.getAdditionalProperty("more"));
                }
            }));
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
            if (nodeChildren.length == 0) {//Still no children ConceptTreeNodeComponent (view not yet initialized)
                //save pending search so it can resume when the children are initialized
                this.pendingSearch.pending = true;
                this.pendingSearch.path = path;
            } else if (this.pendingSearch.pending) {
                //the tree expansion is resumed, reset the pending search
                this.pendingSearch.pending = false;
                this.pendingSearch.path = [];
            }
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
      	var schemeUri = null; //no scheme mode
        if (this.scheme != undefined) {
            schemeUri = this.scheme.getURI();
        }
        this.skosService.getNarrowerConcepts(this.node.getURI(), schemeUri).subscribe(
            narrower => {
                this.node.setAdditionalProperty("children", narrower); //append the retrieved node as child of the expanded node
                //change the class of the subTree div from subtreeClose to subtreeOpen
                this.subTreeStyle = "subTree subtreeOpen";
                this.node.setAdditionalProperty("open", true);
            },
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
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
    
    private onConceptDeleted(deletedConceptURI: string) {
        var children = this.node.getAdditionalProperty("children");
        for (var i=0; i<children.length; i++) {
            if (children[i].getURI() == deletedConceptURI) {
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
    
    private onNarrowerCreated(narrower: ARTURIResource, broaderURI: string) {
        //add the new concept as children only if the parent is the current concept
        if (this.node.getURI() == broaderURI) {
            this.node.getAdditionalProperty("children").push(narrower);
            this.node.setAdditionalProperty("more", 1);
        }
    }
    
    private onConceptRemovedFromScheme(conceptURI: string, schemeURI: string) {
        if (this.scheme != undefined && this.scheme.getURI() == schemeURI) {
            this.onConceptDeleted(conceptURI);
        }
    }
    
    private onBroaderRemoved(conceptURI: string, broaderURI: string) {
        if (broaderURI == this.node.getURI()) {
            this.onConceptDeleted(conceptURI);
        }
    }
    
}