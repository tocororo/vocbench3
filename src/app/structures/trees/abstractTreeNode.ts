import { Directive, ElementRef, EventEmitter, Output, QueryList, SimpleChanges, ViewChild } from "@angular/core";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTResource, ARTURIResource, ResAttribute } from "../../models/ARTResources";
import { TreeListContext } from "../../utils/UIUtils";
import { VBContext } from "../../utils/VBContext";
import { VBEventHandler } from "../../utils/VBEventHandler";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { ModalType } from '../../widget/modal/Modals';
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { AbstractNode } from "../abstractNode";

@Directive()
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
        this.eventSubscriptions.push(this.eventHandler.resourceCreatedUndoneEvent.subscribe(
            (node: ARTURIResource) => this.onResourceCreatedUndone(node)
        ));
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
                for (let i = 0; i < this.children.length; i++) {
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
        return this.expandNodeImpl().pipe(
            map(() => {
                this.initShowExpandCollapseBtn();
                this.nodeExpandEnd.emit();
            })
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
            for (let i = 0; i < this.children.length; i++) {
                if (this.children[i].getURI() == path[0].getURI() && this.children[i].isDeprecated()) {
                    this.basicModals.alert({key:"SEARCH.SEARCH"}, {key:"MESSAGES.RESOURCE_NOT_REACHABLE_IN_TREE_DEPRECATED_IN_PATH", params:{resource: path[path.length-1].getShow()}},
                        ModalType.warning);
                    return;
                }
            }
        }
        let nodeChildren = this.viewChildrenNode.toArray();
        for (let i = 0; i < nodeChildren.length; i++) {//for every ConceptTreeNodeComponent child
            if (nodeChildren[i].node.getURI() == path[0].getURI()) { //look for the next node of the path
                //let the child node expand the remaining path
                path.splice(0, 1);
                nodeChildren[i].expandPath(path);
                return;
            }
        }
        //if this line is reached it means that the first node of the path has not been found
        if (this.context == TreeListContext.dataPanel) {
            this.basicModals.confirm({key:"SEARCH.SEARCH"}, {key:"MESSAGES.RESOURCE_NOT_REACHABLE_IN_TREE_RES_VIEW_MODAL_CONFIRM", params:{resource: path[path.length-1].getShow()}}, ModalType.warning).then(
                confirm => { 
                    this.sharedModals.openResourceView(path[path.length-1], false);
                },
                cancel => {}
            );
        } else {
            this.basicModals.alert({key:"SEARCH.SEARCH"}, {key:"MESSAGES.RESOURCE_NOT_REACHABLE_IN_TREE", params:{resource: path[path.length-1].getShow()}}, ModalType.warning);
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
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].getNominalValue() == deletedNode.getNominalValue()) {
                if (VBContext.getWorkingProject().isValidationEnabled()) {
                    /**
                     * In case of validation don't do nothing, the removal of a triple like
                     * :child skos:broader :parent 
                     * doesn't imply the removal of the child, but simply that the above triple is replicated in the staging-remove graph
                     */
                } else {
                    this.removeChildAtPos(i);
                }
                break;
            }
        }
    }

    onResourceCreatedUndone(node: ARTResource) {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].equals(node)) {
                //remove it independently from validation (when enabled, the "undo" of a creation doesn't mark the node as staged-del, but simply cancels the creation, so removes it)
                this.removeChildAtPos(i);
                break;
            }
        }
    }

    private removeChildAtPos(pos: number) {
        this.children.splice(pos, 1);
        //if node has no more children change info of node so the UI will update
        if (this.children.length == 0) {
            this.node.setAdditionalProperty(ResAttribute.MORE, 0);
            this.open = false;
            this.initShowExpandCollapseBtn();
        }
    }

    onChildCreated(parent: ARTResource, child: ARTResource) {
        //if the parent is the current node, update more attribute
        if (this.node.getNominalValue() == parent.getNominalValue()) {
            this.node.setAdditionalProperty(ResAttribute.MORE, 1);
            if (this.open) { //if node is open, show the child with its children
                this.children.unshift(<ARTURIResource>child);
                //in the addPropertyValue context, select the newly created node
                if (this.context == TreeListContext.addPropValue) {
                    setTimeout(() => { //gives time to update the viewChildrenNode
                        this.selectChild(<ARTURIResource>child);
                    });
                }
            } else {
                this.expandNode().subscribe(
                    () => {
                        if (this.context == TreeListContext.addPropValue) {
                            setTimeout(() => {
                                this.selectChild(<ARTURIResource>child);
                            });
                        }
                    }
                );
            }
        }
    }

    private selectChild(child: ARTURIResource) {
        this.viewChildrenNode.forEach(c => {
            if (c.node.equals(child)) {
                c.selectNode();
            }
        })
    }

    onParentAdded(parent: ARTResource, child: ARTResource) {
        if (this.node.equals(parent)) {//if the parent is the current node
            this.node.setAdditionalProperty(ResAttribute.MORE, 1); //update more
            //if it was open add the child to the visible children (if not laready among them)
            if (this.open && !this.children.some(c => c.equals(child))) {
                this.children.push(<ARTURIResource>child);
            }
            this.initShowExpandCollapseBtn();
        }
    }

    onParentRemoved(parent: ARTResource, child: ARTResource) {
        if (parent.getNominalValue() == this.node.getNominalValue()) {
            this.onTreeNodeDeleted(child);
        }
    }

}