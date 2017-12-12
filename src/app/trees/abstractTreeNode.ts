import { Component, Input, Output, ViewChild, QueryList, ElementRef, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { AbstractNode } from "./abstractNode";
import { ARTResource, ARTURIResource, ARTNode, ResAttribute } from "../models/ARTResources";
import { SemanticTurkey } from "../models/Vocabulary";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBContext } from "../utils/VBContext";

@Component({
    selector: "tree-node",
    template: "",
})
export abstract class AbstractTreeNode extends AbstractNode {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

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

    /**
     * CONSTRUCTOR
     */
    protected basicModals: BasicModalServices;
    constructor(eventHandler: VBEventHandler, basicModals: BasicModalServices) {
        super(eventHandler);
        this.basicModals = basicModals;
    }

    /**
     * METHODS
     */

    ngAfterViewInit() {
        //if the resource is new (just created), make it visible in the view
        if (this.node.getAdditionalProperty(ResAttribute.NEW)) {
            this.treeNodeElement.nativeElement.scrollIntoView({block: 'end', behavior: 'smooth'});
            this.node.deleteAdditionalProperty(ResAttribute.NEW);
        }
        //in case of node initialized after switching on the "showDeprecated" and the node was expanded
        if (this.node.getAdditionalProperty(ResAttribute.CHILDREN).length > 0) {
            setTimeout(() => this.open = true);
        }
    }

    /**
     * Tells if the expand/collapse button should be shown according to the deprecated resources filter
     */
    private showExpandCollapse(): boolean {
        let more: boolean = this.node.getAdditionalProperty(ResAttribute.MORE);
        if (more) {
            let children: ARTURIResource[] = this.node.getAdditionalProperty(ResAttribute.CHILDREN);
            if (children.length > 0) {
                let childNotDeprecated: boolean = false;
                for (var i = 0; i < children.length; i++) {
                    if (!children[i].isDeprecated()) {
                        childNotDeprecated = true;
                        break;
                    }
                }
                return (this.showDeprecated == true || (!this.showDeprecated && childNotDeprecated));
            } else { //no children and "more" true means that the node has not been yet expanded, so in the doubt return true
                return true;
            }
        } else {
            return false;
        }
    }

    /**
	 * Function called when "+" button is clicked.
	 * Gets a node as parameter and retrieves with an http call the children of the node,
	 * then expands the subtree div.
	 */
    expandNode(): Observable<any> {
        this.nodeExpandStart.emit();
        return this.expandNodeImpl().map(
            () => {
                this.nodeExpandEnd.emit();
            }
        );
    }
    /**
     * Implementation of the expansion. It calls the  service for getting the child of a node in the given tree
     */
    abstract expandNodeImpl(): Observable<any>;

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
            this.treeNodeElement.nativeElement.scrollIntoView({block: 'end', behavior: 'smooth'});
            //not sure if it has to be selected (this method could be used in some scenarios where there's no need to select the node)
            if (!this.node.getAdditionalProperty(ResAttribute.SELECTED)) { //select the searched node only if is not yet selected
                this.selectNode();
            }
        } else {
            if (!this.open) { //if node is close, expand itself
                this.expandNode().subscribe(
                    () => {
                        //trigger a round of change detection so that the view children are rendered
                        setTimeout(
                            () => {
                                this.expandChild(path);
                            }
                        );
                        
                    }
                );
            } else {
                this.expandChild(path);
            }
        }
    }

    private expandChild(path: ARTURIResource[]) {
        //If the deprecated nodes are hidden, check if the path pass through a deprecated node not visible
        if (!this.showDeprecated) {
            let children: ARTURIResource[] = this.node.getAdditionalProperty(ResAttribute.CHILDREN);
            for (var i = 0; i < children.length; i++) {
                if (children[i].getURI() == path[0].getURI() && children[i].isDeprecated()) {
                    this.basicModals.alert("Search", "Node " + path[path.length-1].getShow() + 
                        " is not reachable in the current tree since the path to reach it contains a deprecated node." +
                        " Enable the show of deprecated resources and repeat the search", "warning");
                    return;
                }
            }
        }
        let nodeChildren = this.viewChildrenNode.toArray();
        for (var i = 0; i < nodeChildren.length; i++) {//for every ConceptTreeNodeComponent child
            if (nodeChildren[i].node.getURI() == path[0].getURI()) { //look for the next node of the path
                //let the child node expand the remaining path
                path.splice(0, 1);
                nodeChildren[i].expandPath(path);
                return;
            }
        }
        //if this line is reached it means that the first node of the path has not been found
        this.basicModals.alert("Search", "Node " + path[path.length-1].getShow() + " is not reachable in the current tree", "warning");
    }

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
                children.unshift(child);
            } else {
                this.expandNode().subscribe();
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