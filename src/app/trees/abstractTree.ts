import { Component, Input, Output, ViewChild, ElementRef, EventEmitter } from "@angular/core";
import { ARTURIResource, ResAttribute } from "../models/ARTResources";
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
    @Input() rendering: boolean = true; //if true the nodes in the tree should be rendered with the show, with the qname otherwise
    @Input() hideSearch: boolean = false; //if true hide the search bar at the bottom of the tree
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

    abstract doSearch(searchedText: string): void;

    abstract openTreeAt(node: ARTURIResource): void;

    /**
     * Handles the keydown event in search text field (when enter key is pressed execute the search)
     */
    private searchKeyHandler(key: number, searchedText: string) {
        if (key == 13) {
            this.doSearch(searchedText);
        }
    }

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

}