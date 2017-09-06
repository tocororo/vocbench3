import { Component, Input, Output, ViewChild, ElementRef, EventEmitter } from "@angular/core";
import { ARTURIResource, ARTResource, ResAttribute } from "../models/ARTResources";
import { VBEventHandler } from "../utils/VBEventHandler";
import { UIUtils } from "../utils/UIUtils";

@Component({
    selector: "tree",
    templateUrl: "./owl/classTree/classTreeComponent.html",
})
export abstract class AbstractTree {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    @ViewChild('blockDivTree') public blockDivElement: ElementRef;//the element in the view referenced with #blockDivTree
    @ViewChild('scrollableContainer') scrollableElement: ElementRef;
    @Input() rendering: boolean = true; //if true the nodes in the tree should be rendered with the show, with the qname otherwise
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

    /**
     * ATTRIBUTES
     */

    eventSubscriptions: any[] = [];
    roots: ARTURIResource[];
    selectedNode: ARTURIResource;

    /**
     * CONSTRUCTOR
     */
    protected eventHandler: VBEventHandler;
    constructor(eventHandler: VBEventHandler) {
        this.eventHandler = eventHandler;
        this.eventSubscriptions.push(eventHandler.refreshDataBroadcastEvent.subscribe(() => this.initTree()));
    }

    /**
     * METHODS
     */

    /**
     * Here I use ngAfterViewInit instead of ngOnInit because I need to wait that 
     * the view is initialized because in initTree() there is a reference to #blockDivTree
     */
    ngAfterViewInit() {
        /* Following check needed to avoid to call 2 times initTree() if an @Input is provided:
         * - 1st time in ngOnChanges when the input value is bound (so changes from undefined to its value)
         * - 2nd time here in ngAfterViewInit
         * I cannot resolve by deleting this method since if the @Input is not provided at all,
         * ngOnChanges is not called, so neither initTree */
        if (this.roots == undefined) {
            this.initTree();
        }
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    abstract initTree(): void;

    abstract openTreeAt(node: ARTURIResource): void;

    //Listeners to node expansion start/end. Simply show/hide the loading div
    private onNodeExpandStart() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
    }
    private onNodeExpandEnd() {
        UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
    }
    private onNodeSelected(node: ARTURIResource) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAdditionalProperty(ResAttribute.SELECTED);
        }
        this.selectedNode = node;
        this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(node);
    }

    //BROADCAST EVENT HANDLERS

    onTreeNodeDeleted(deletedNode: ARTResource) {
        //check if the node to delete is a root
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == deletedNode.getNominalValue()) {
                this.roots.splice(i, 1);
                break;
            }
        }
        //reset the selected node
        this.nodeSelected.emit(undefined);
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
    ensureRootVisibility(resource: ARTURIResource) {
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == resource.getURI()) {
                if (i >= this.rootLimit) {
                    //update rootLimit so that node at index i is within the range
                    let scrollStep: number = ((i - this.rootLimit)/this.increaseRate)+1;
                    this.rootLimit = this.rootLimit + this.increaseRate*scrollStep;
                }
                break;
            }
        }
    }

}