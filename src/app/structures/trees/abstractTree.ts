import { Directive, ElementRef, QueryList, ViewChild } from "@angular/core";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../../models/ARTResources";
import { SemanticTurkey } from "../../models/Vocabulary";
import { TreeListContext, UIUtils } from "../../utils/UIUtils";
import { VBContext } from "../../utils/VBContext";
import { VBEventHandler } from "../../utils/VBEventHandler";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { ModalType } from '../../widget/modal/Modals';
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { AbstractStruct } from "../abstractStruct";
import { AbstractTreeNode } from "./abstractTreeNode";

@Directive()
export abstract class AbstractTree extends AbstractStruct {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    @ViewChild('blockDivTree', { static: true }) public blockDivElement: ElementRef;//the element in the view referenced with #blockDivTree
    // public blockDivElement: ElementRef;//the element in the view referenced with #blockDivTree
    abstract viewChildrenNode: QueryList<AbstractTreeNode>;

    /**
     * Searched resource that is waiting to be expanded/selected once the root list is initialized.
     * This is expecially useful in case a search returns concept not in the current active scheme,
     * if the user activates the scheme which the concept belongs, it could be necessary to wait that the tree is initialized again 
     * (with the new scheme) and so once the roots are initialized it attempts again to expand the path to the searched concept 
     */
    protected pendingSearchPath: ARTURIResource[];

    /**
     * ATTRIBUTES
     */
    roots: ARTURIResource[];

    /**
     * CONSTRUCTOR
     */
    protected basicModals: BasicModalServices;
    protected sharedModals: SharedModalServices;
    constructor(eventHandler: VBEventHandler, basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(eventHandler);
        this.basicModals = basicModals;
        this.sharedModals = sharedModals;
        this.eventSubscriptions.push(this.eventHandler.resourceCreatedUndoneEvent.subscribe(
            (node: ARTURIResource) => this.onResourceCreatedUndone(node)
        ));
    }

    /**
     * METHODS
     */

    /**
     * Here I use ngAfterViewInit instead of ngOnInit because I need to wait that 
     * the view is initialized because in initImpl() there is a reference to #blockDivTree
     */
    ngAfterViewInit() {
        /* The following check is needed to avoid to call 2 times initImpl() if an @Input is provided:
         * - 1st time in ngOnChanges (if it is defined in the treeComponent implementation) when the @Input parameter is bound 
         * - 2nd time here in ngAfterViewInit
         * I cannot resolve by deleting this method since if none of the @Input parameters is provided to the treeComponent,
         * ngOnChanges() is not called, so neither init()) */
        if (this.roots == undefined) {
            setTimeout(() => { this.init(); });
        }
    }

    init() {
        this.setInitialStatus();
        this.initImpl();
    }

    abstract initImpl(): void;

    setInitialStatus() {
        this.roots = [];
        this.selectedNode = null;
        this.nodeSelected.emit(this.selectedNode);
        this.checkedNodes = [];
        this.nodeChecked.emit(this.checkedNodes);
        this.rootLimit = this.initialRoots;
    }

    abstract openTreeAt(node: ARTURIResource): void;

    /**
     * Expand the given "path" in order to reach "node" starting from the root.
     * This method could be invoked also from the parent panel for selecting an advanced search result in search-based mode.
     * @param path 
     * @param node 
     */
    openRoot(path: ARTURIResource[]) {
        if (this.ensureRootVisibility(path[0], path)) { //if root is visible
            setTimeout(() => { //wait the the UI is updated after the (possible) update of rootLimit
                UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
                let childrenNodeComponent = this.viewChildrenNode.toArray();
                for (let child of childrenNodeComponent) {
                    if (child.node.equals(path[0])) {
                        //let the found node expand itself and the remaining path
                        path.splice(0, 1);
                        child.expandPath(path);
                        UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                        return;
                    }
                }
                //if this line is reached it means that the first node of the path has not been found
                this.onTreeNodeNotFound(path[path.length-1]);
            });
        } else {
            /* 
            if the node is not among the roots at all, it may be that the roots are still not initialized (e.g. after a scheme change following a concept search).
            So, only for concept tree (which, at the moment, is the only struct that uses the pending search) store pending search.
            Note that this prevent to distinguish those cases where the first element of the path is not found due to a tree that is still initializing, or those where
            the path does not exist at all. This second case should never happen since ST should always return the correct path, the only case where
            a not existing path could be returned should be in Property tree when it is filtered according the suggested property of a "source" resource (e.g. in the
            add value modal when "Show all" is unchecked)
            */
            if (this.structRole == RDFResourceRolesEnum.concept) {
                this.pendingSearchPath = path;
            } else {
                this.onTreeNodeNotFound(path[path.length-1]);
            }
        }
    }

    //Listeners to node expansion start/end. Simply show/hide the loading div
    onNodeExpandStart() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
    }
    onNodeExpandEnd() {
        UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
    }

    //BROADCAST EVENT HANDLERS

    onTreeNodeDeleted(deletedNode: ARTResource) {
        //check if the node to delete is a root
        for (let i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == deletedNode.getNominalValue()) {
                if (VBContext.getWorkingProject().isValidationEnabled()) {
                    //replace the resource instead of simply change the graphs, so that the rdfResource detect the change
                    let stagedRes: ARTURIResource = this.roots[i].clone();
                    stagedRes.setGraphs([new ARTURIResource(SemanticTurkey.stagingRemoveGraph + VBContext.getWorkingProject().getBaseURI())]);
                    stagedRes.setAdditionalProperty(ResAttribute.EXPLICIT, false);
                    stagedRes.setAdditionalProperty(ResAttribute.SELECTED, false);
                    this.roots[i] = stagedRes;
                } else {
                    this.roots.splice(i, 1);
                }
                break;
            }
        }
    }

    onResourceCreatedUndone(node: ARTResource) {
        //check if the node to delete is a root
        for (let i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == node.getNominalValue()) {
                //remove it independently from validation (when enabled, the "undo" of a creation doesn't mark the node as staged-del, but simply cancels the creation, so removes it)
                this.roots.splice(i, 1); 
                break;
            }
        }
    }

    //Root limitation management
    initialRoots: number = 150;
    rootLimit: number = this.initialRoots;
    private increaseRate: number = this.initialRoots/5;
    onScroll() {
        let scrollElement: HTMLElement = this.scrollableElement.nativeElement;
        // if (scrollElement.scrollTop === (scrollElement.scrollHeight - scrollElement.offsetHeight)) {
        //consider a little buffer of 2px in order to prevent potential problems (see https://stackoverflow.com/a/32283147/5805661)
        if (Math.abs(scrollElement.scrollHeight - scrollElement.offsetHeight - scrollElement.scrollTop) < 2) {
            //bottom reached => increase max range if there are more roots to show
            if (this.rootLimit < this.roots.length) { 
                this.rootLimit = this.rootLimit + this.increaseRate;
            }
        } 
    }
    /**
     * Ensures that the root of the searched path is visible.
     * If visible returns true, otherwise store the pending search and returns false.
     * @param resource 
     * @param path 
     */
    ensureRootVisibility(resource: ARTURIResource, path: ARTURIResource[]): boolean {
        for (let i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == resource.getURI()) {
                if (i >= this.rootLimit) {
                    //update rootLimit so that node at index i is within the range
                    let scrollStep: number = ((i - this.rootLimit)/this.increaseRate)+1;
                    this.rootLimit = this.rootLimit + this.increaseRate*scrollStep;
                }
                //if there was any pending search, reset it
                if (this.pendingSearchPath) {
                    this.pendingSearchPath = null;
                }
                return true;
            }
        }
        //if this code is reached, the root was not found (probably it is waiting that the roots are initialized)
        return false;
    }

    onTreeNodeNotFound(node: ARTURIResource) {
        if (this.context == TreeListContext.dataPanel) {
            this.basicModals.confirm({key:"SEARCH.SEARCH"}, {key:"MESSAGES.RESOURCE_NOT_REACHABLE_IN_TREE_RES_VIEW_MODAL_CONFIRM", params:{resource: node.getShow()}}, ModalType.warning).then(
                confirm => { 
                    this.sharedModals.openResourceView(node, false);
                },
                cancel => {}
            );
        } else {
            this.basicModals.alert({key:"SEARCH.SEARCH"}, {key:"MESSAGES.RESOURCE_NOT_REACHABLE_IN_TREE", params:{resource: node.getShow()}}, ModalType.warning);
        }
        
    }

}