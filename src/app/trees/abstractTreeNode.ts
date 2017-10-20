import { Component, Input, Output, ViewChild, QueryList, ElementRef, EventEmitter } from "@angular/core";
import { ARTResource, ARTURIResource, ARTNode, ResAttribute } from "../models/ARTResources";
import { SemanticTurkey } from "../models/Vocabulary";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBContext } from "../utils/VBContext";

@Component({
    selector: "tree-node",
    templateUrl: "./owl/classTree/classTreeNodeComponent.html",
})
export abstract class AbstractTreeNode {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    @Input() node: ARTURIResource;
    @Input() rendering: boolean; //if true the node be rendered with the show, with the qname otherwise
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    @Output() nodeExpandStart = new EventEmitter<any>(); //emit an event when the user click on button to expand a subTree of a node
    @Output() nodeExpandEnd = new EventEmitter<any>(); //emit an event when the subTree expansion is completed

    //get an element in the view referenced with #treeNodeElement (useful to apply scrollIntoView in the search function)
    @ViewChild('treeNodeElement') treeNodeElement: ElementRef;
    //<Class/Concept/..:>TreeNodeComponent children of this Component (useful to open tree for the search)
    abstract viewChildrenNode: QueryList<AbstractTreeNode>;

    /**
     * ATTRIBUTES
     */
    open: boolean = false;

    //structure to support the tree opening
    pendingSearch: { pending: boolean, path: ARTURIResource[] } = {
        pending: false, //tells if there is a pending search waiting that children view are initialized 
        path: [], //remaining path of the tree to open
    }

    eventSubscriptions: any[] = [];

    /**
     * CONSTRUCTOR
     */
    protected eventHandler: VBEventHandler;
    protected basicModals: BasicModalServices;
    constructor(eventHandler: VBEventHandler, basicModals: BasicModalServices) {
        this.eventHandler = eventHandler;
        this.basicModals = basicModals;
    }

    /**
     * METHODS
     */

    ngAfterViewInit() {
        //when ClassTreeNodeComponent children are added, looks for a pending search to resume
        this.viewChildrenNode.changes.subscribe(
            c => {
                if (this.pendingSearch.pending) {//there is a pending search
                    /* setTimeout to trigger a new round of change detection avoid an exception due to changes in a lifecycle hook
                    (see https://github.com/angular/angular/issues/6005#issuecomment-165911194) */
                    window.setTimeout(() =>
                        this.expandPath(this.pendingSearch.path)
                    );
                }
            }
        );
        //if the resource is new (just created), make it visible in the view
        if (this.node.getAdditionalProperty(ResAttribute.NEW)) {
            this.treeNodeElement.nativeElement.scrollIntoView();
            this.node.deleteAdditionalProperty(ResAttribute.NEW);
        }
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    /**
	 * Function called when "+" button is clicked.
	 * Gets a node as parameter and retrieves with an http call the children of the node,
	 * then expands the subtree div.
	 */
    abstract expandNode(): void;

    /**
   	 * Function called when "-" button is clicked.
   	 * Collapse the subtree div.
   	 */
    private collapseNode() {
        this.open = false;
        this.node.setAdditionalProperty(ResAttribute.CHILDREN, []);
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
            if (!this.node.getAdditionalProperty(ResAttribute.SELECTED)) { //select the searched node only if is not yet selected
                this.selectNode();
            }
        } else {
            if (!this.open) { //if node is close, expand itself
                this.expandNode();
            }
            var nodeChildren = this.viewChildrenNode.toArray();
            if (nodeChildren.length == 0) {//Still no children ConceptTreeNodeComponent (view not yet initialized)
                //save pending search so it can resume when the children are initialized
                this.pendingSearch.pending = true;
                this.pendingSearch.path = path;
                return;
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
                    return;
                }
            }
            //if this line is reached it means that the first node of the path has not been found
            this.basicModals.alert("Search", "Node " + path[path.length-1].getShow() + " is not reachable in the current tree");
        }
    }

    /**
     * Called when the node is clicked. This function emit an event 
     */
    private selectNode() {
        this.nodeSelected.emit(this.node);
    }

    /**
     * Called when a rdf-resource is clicked. 
     */
    // private onResourceClicked(event: MouseEvent) {
    //     if (event.ctrlKey) { //ctrl + click
    //         this.nodeCtrlClicked.emit(this.node);
    //     } else {
    //         this.selectNode();
    //     }
    // }

    /**
     * Listener to the nodeSelected @Output event, called when a node in the subTree is clicked
     */
    private onNodeSelected(node: ARTURIResource) {
        this.nodeSelected.emit(node);
    }

    //Listeners to node expansion start/end. Simply forward the event to the parent
    private onNodeExpandStart() {
        this.nodeExpandStart.emit();
    }
    private onNodeExpandEnd() {
        this.nodeExpandEnd.emit();
    }

    //BROADCAST EVENTS HANDLERS

    /**
     * Called when a resource is renamed in resource view.
     * This function replace the uri of the resource contained in the node if it is the resource
     * affected by the renaming.
     */
    onResourceRenamed(oldResource: ARTURIResource, newResource: ARTURIResource) {
        if (oldResource.getURI() == this.node.getURI()) {
            // this.node[ResAttribute.SHOW] = newResource.getShow();
            this.node.setURI(newResource.getURI());
        }
    }

    onTreeNodeDeleted(deletedNode: ARTResource) {
        var children = this.node.getAdditionalProperty(ResAttribute.CHILDREN);
        for (var i = 0; i < children.length; i++) {
            if (children[i].getURI() == deletedNode.getNominalValue()) {
                if (VBContext.getWorkingProject().isValidationEnabled()) {
                    //replace the resource instead of simply change the graphs, so that the rdfResource detect the change
                    let stagedRes: ARTURIResource = children[i].clone();
                    stagedRes.setGraphs([new ARTURIResource(SemanticTurkey.stagingRemoveGraph + VBContext.getWorkingProject().getBaseURI())]);
                    stagedRes.setAdditionalProperty(ResAttribute.EXPLICIT, false);
                    stagedRes.setAdditionalProperty(ResAttribute.SELECTED, false);
                    children[i] = stagedRes;
                } else {
                    children.splice(i, 1);
                    //if node has no more children change info of node so the UI will update
                    if (children.length == 0) {
                        this.node.setAdditionalProperty(ResAttribute.MORE, 0);
                        this.open = false;
                    }
                }
                break;
            }
        }
    }

    onChildCreated(parent: ARTResource, child: ARTResource) {
        //if the parent is the current node, update more attribute
        if (this.node.getNominalValue() == parent.getNominalValue()) {
            this.node.setAdditionalProperty(ResAttribute.MORE, 1);
            if (this.open) { //if node is open, show the child with its children
                let children: ARTResource[] = this.node.getAdditionalProperty(ResAttribute.CHILDREN);
                // children.push(child);
                children.unshift(child);
            } else {
                this.expandNode();
                // this.treeNodeElement.nativeElement.scrollIntoView();
            }
        }
    }

    onParentAdded(parent: ARTResource, child: ARTResource) {
        if (this.node.getNominalValue() == parent.getNominalValue()) {//if the parent is the current node
            this.node.setAdditionalProperty(ResAttribute.MORE, 1); //update more
            //if it was open add the child to the visible children
            if (this.open) {
                this.node.getAdditionalProperty(ResAttribute.CHILDREN).push(child);
            }
        }
    }

    onParentRemoved(parent: ARTResource, child: ARTResource) {
        if (parent.getNominalValue() == this.node.getURI()) {
            this.onTreeNodeDeleted(child);
        }
    }

}