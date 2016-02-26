import {Component, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {OwlServices} from "../../services/owlServices";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";

@Component({
	selector: "class-tree-node",
	templateUrl: "app/src/owl/classTree/classTreeNodeComponent.html",
    directives: [RdfResourceComponent, ClassTreeNodeComponent],
    providers: [OwlServices],
})
export class ClassTreeNodeComponent {
	@Input() node:ARTURIResource;
    
    //get an element in the view referenced with #treeNodeElement (useful to apply scrollIntoView in the search function)
    @ViewChild('treeNodeElement') treeNodeElement;
    //ClassTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(ClassTreeNodeComponent) viewChildrenNode: QueryList<ClassTreeNodeComponent>;
    //structure to support the tree opening
    private pendingSearch = {
        pending: false, //tells if there is a pending search waiting that children view are initialized 
        path: [], //remaining path of the tree to open
    }
    
    private eventSubscriptions = [];
    
    private subTreeStyle: string = "subTree subtreeClose"; //to change dynamically the subtree style (open/close) 
	
	constructor(private owlService:OwlServices, private eventHandler:VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.subClassCreatedEvent.subscribe(
            data => this.onSubClassCreated(data.subClass, data.superClass)));
        this.eventSubscriptions.push(eventHandler.classDeletedEvent.subscribe(cls => this.onClassDeleted(cls)));
        this.eventSubscriptions.push(eventHandler.subClassRemovedEvent.subscribe(
            data => this.onSubClassRemoved(data.cls, data.subClass)));
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            data => this.onResourceRenamed(data.oldResource, data.newResource)));
        this.eventSubscriptions.push(eventHandler.instanceDeletedEvent.subscribe(
            data => this.onInstanceDeleted(data.cls)));
        this.eventSubscriptions.push(eventHandler.instanceCreatedEvent.subscribe(
            data => this.onInstanceCreated(data.instance, data.cls)));
    }
    
    ngOnInit() {
        if (this.node.getURI() == "http://www.w3.org/2002/07/owl#Thing") {
            this.expandNode();
        }
    }
    
    ngAfterViewInit() {
        //when ClassTreeNodeComponent children are added, looks for a pending search to resume
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
	 * Gets a node as parameter and retrieve with an http call the subClass of the node,
	 * then expands the subtree div.
	 */
    public expandNode() {
        this.owlService.getSubClasses(this.node, true, true).subscribe(
            subClasses => {
                this.node.setAdditionalProperty("children", subClasses); //append the retrieved node as child of the expanded node
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
        this.eventHandler.classTreeNodeSelectedEvent.emit(this.node);
    }
    
    //EVENT LISTENERS
    
    private onClassDeleted(cls: ARTURIResource) {
        var children = this.node.getAdditionalProperty("children");
        for (var i=0; i<children.length; i++) {
            if (children[i].getURI() == cls.getURI()) {
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
    
    private onSubClassCreated(subClass: ARTURIResource, superClass: ARTURIResource) {
        //add the new class as children only if the parent is the current class
        if (this.node.getURI() == superClass.getURI()) {
            this.node.getAdditionalProperty("children").push(subClass);
            this.node.setAdditionalProperty("more", 1);
        }
    }
    
    private onSubClassRemoved(cls: ARTURIResource, subClass: ARTURIResource) {
        if (cls.getURI() == this.node.getURI()) {
            this.onClassDeleted(subClass);
        }
    }
    
    private onResourceRenamed(oldResource: ARTURIResource, newResource: ARTURIResource) {
        if (oldResource.getURI() == this.node.getURI()) {
            this.node['show'] = newResource.getShow();
            this.node['uri'] = newResource.getURI();
        }
    }
	
    //decrease numInst property when an instance of the current class is deleted
    onInstanceDeleted(cls: ARTURIResource) {
        if (this.node.getURI() == cls.getURI()) {
            var numInst = this.node.getAdditionalProperty("numInst");
            this.node.setAdditionalProperty("numInst", numInst-1);
        }
    }
    
    //increase numInst property when an instance of the current class is created
    onInstanceCreated(instance: ARTURIResource, cls: ARTURIResource) {
        if (this.node.getURI() == cls.getURI()) {
            var numInst = this.node.getAdditionalProperty("numInst");
            this.node.setAdditionalProperty("numInst", numInst+1);
        }
    }
}