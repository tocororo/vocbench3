import { Component, ElementRef, EventEmitter, Output, QueryList, ViewChild, SimpleChanges } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTResource, ARTURIResource, ResAttribute } from "../models/ARTResources";
import { SemanticTurkey } from "../models/Vocabulary";
import { VBContext } from "../utils/VBContext";
import { VBEventHandler } from "../utils/VBEventHandler";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { AbstractNode } from "./abstractNode";
import { TreeListContext } from "../utils/UIUtils";

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
    children: ARTURIResource[] = [];
    open: boolean = false;

    showExpandCollapseBtn: boolean = false; //tells if the expand/collapse node button should be visible (it depends on more_attr and showDeprecated)

    /**
     * CONSTRUCTOR
     */
    protected basicModals: BasicModalServices;
    constructor(eventHandler: VBEventHandler, basicModals: BasicModalServices, private sharedModals: SharedModalServices) {
        super(eventHandler);
        this.basicModals = basicModals;
    }

    /**
     * METHODS
     */

    ngOnInit() {
        this.initShowExpandCollapseBtn();
    }

    ngAfterViewInit() {
        //if the resource is new (just created), make it visible in the view
        if (this.node.getAdditionalProperty(ResAttribute.NEW)) {
            this.treeNodeElement.nativeElement.scrollIntoView({block: 'end', behavior: 'smooth'});
            this.node.deleteAdditionalProperty(ResAttribute.NEW);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['showDeprecated']) {
            this.initShowExpandCollapseBtn();
        }
    }

    /**
     * The expand/collapse button should be visible if:
     * the node has "more" attribute true AND
     * - "showDeprecated" is true (all children visible)
     * - or "showDeprecated" is false (only not-deprecated children visible) but there is at least a child not-deprecated 
     */
    protected initShowExpandCollapseBtn() {
        let more: boolean = this.node.getAdditionalProperty(ResAttribute.MORE);
        if (more) { //if the more attribute is true, doesn't implies that the button is visible, the node children could be all deprecated
            if (this.children.length > 0) {
                let childVisible: boolean = false; //true if showDeprecated true, or child not-deprecated
                for (var i = 0; i < this.children.length; i++) {
                    if (this.showDeprecated || !this.children[i].isDeprecated()) {
                        childVisible = true;
                        break;
                    }
                }
                //button visible if there is at least a visible child
                this.showExpandCollapseBtn = childVisible;
            } else { //no children and "more" true means that the node has not been yet expanded, so in the doubt return true
                this.showExpandCollapseBtn = true;
            }
        } else {
            this.showExpandCollapseBtn = false;
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
                this.initShowExpandCollapseBtn();
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
        this.children.forEach((c: ARTURIResource) => {
            this.nodeChecked.emit({node: c, checked: false}); //uncheck all the children
        })
        this.children = [];
    }

    /**
     * Expand recursively the given path untill the final node.
     * If the given path is empty then the current node is the searched one, otherwise
     * the current node expands itself (if is closed), looks among its children for the following node of the path,
     * then call recursively expandPath() for the child node.
     */
    public expandPath(path: ARTURIResource[]) {
        if (path.length == 0) { //this is the last node of the path. Focus it in the tree
            this.selectNode();
            setTimeout(() => { //give time to update the view (after selectNode the res view could make reduce the size of the tree)
                this.treeNodeElement.nativeElement.scrollIntoView({block: 'end', behavior: 'smooth'});
            });
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
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].getURI() == path[0].getURI() && this.children[i].isDeprecated()) {
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
        if (this.context == TreeListContext.dataPanel) {
            this.basicModals.confirm("Search", "Node " + path[path.length-1].getShow() + " is not reachable in the current tree. "
                + "Do you want to open its ResourceView in a modal dialog?", "warning").then(
                confirm => { 
                    this.sharedModals.openResourceView(path[path.length-1], false);
                },
                cancel => {}
            );
        } else {
            this.basicModals.alert("Search", "Node " + path[path.length-1].getShow() + " is not reachable in the current tree.", "warning");
        }
    }

    /**
     * Listener to the nodeSelected @Output event, called when a node in the subTree is clicked
     */
    private onNodeSelected(node: ARTURIResource) {
        this.nodeSelected.emit(node);
    }

    private onNodeChecked(event: { node: ARTURIResource, checked: boolean }) {
        this.nodeChecked.emit(event);
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
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].getNominalValue() == deletedNode.getNominalValue()) {
                if (VBContext.getWorkingProject().isValidationEnabled()) {
                    //replace the resource instead of simply change the graphs, so that the rdfResource detect the change
                    let stagedRes: ARTURIResource = this.children[i].clone();
                    stagedRes.setGraphs([new ARTURIResource(SemanticTurkey.stagingRemoveGraph + VBContext.getWorkingProject().getBaseURI())]);
                    stagedRes.setAdditionalProperty(ResAttribute.EXPLICIT, false);
                    stagedRes.setAdditionalProperty(ResAttribute.SELECTED, false);
                    this.children[i] = stagedRes;
                } else {
                    this.children.splice(i, 1);
                    //if node has no more children change info of node so the UI will update
                    if (this.children.length == 0) {
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
                this.children.unshift(<ARTURIResource>child);
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
                this.children.push(<ARTURIResource>child);
            }
        }
    }

    onParentRemoved(parent: ARTResource, child: ARTResource) {
        if (parent.getNominalValue() == this.node.getNominalValue()) {
            this.onTreeNodeDeleted(child);
        }
    }

}