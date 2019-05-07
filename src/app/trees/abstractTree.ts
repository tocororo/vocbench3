import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { ARTResource, ARTURIResource, ResAttribute } from "../models/ARTResources";
import { SemanticTurkey } from "../models/Vocabulary";
import { UIUtils, TreeListContext } from "../utils/UIUtils";
import { VBContext } from "../utils/VBContext";
import { VBEventHandler } from "../utils/VBEventHandler";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { AbstractStruct } from "./abstractStruct";

@Component({
    selector: "tree",
    template: "",
})
export abstract class AbstractTree extends AbstractStruct {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    @ViewChild('blockDivTree') public blockDivElement: ElementRef;//the element in the view referenced with #blockDivTree

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

    //Listeners to node expansion start/end. Simply show/hide the loading div
    private onNodeExpandStart() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
    }
    private onNodeExpandEnd() {
        UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
    }

    //BROADCAST EVENT HANDLERS

    onTreeNodeDeleted(deletedNode: ARTResource) {
        //check if the node to delete is a root
        for (var i = 0; i < this.roots.length; i++) {
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

    //Root limitation management
    initialRoots: number = 100;
    rootLimit: number = this.initialRoots;
    private increaseRate: number = this.initialRoots/5;
    private onScroll() {
        let scrollElement: HTMLElement = this.scrollableElement.nativeElement;
        if (scrollElement.scrollTop === (scrollElement.scrollHeight - scrollElement.offsetHeight)) {
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
        for (var i = 0; i < this.roots.length; i++) {
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
        //if this code is reached, the root is not found (so probably it is waiting that the roots are initialized)
        this.pendingSearchPath = path;
        return false;
    }

    onTreeNodeNotFound(node: ARTURIResource) {
        if (this.context == TreeListContext.dataPanel) {
            this.basicModals.confirm("Search", "Node " + node.getShow() + " is not reachable in the current tree. "
                + "Do you want to open its ResourceView in a modal dialog?", "warning").then(
                confirm => { 
                    this.sharedModals.openResourceView(node, false);
                },
                cancel => {}
            );
        } else {
            this.basicModals.alert("Search", "Node " + node.getShow() + " is not reachable in the current tree.", "warning");
        }
        
    }

}