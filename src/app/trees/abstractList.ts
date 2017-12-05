import { Component, Input, Output, ViewChild, ElementRef, EventEmitter, QueryList } from "@angular/core";
import { AbstractListNode } from "./abstractListNode";
import { ARTURIResource, ARTResource, ResAttribute } from "../models/ARTResources";
import { SemanticTurkey } from "../models/Vocabulary";
import { VBContext } from "../utils/VBContext";
import { VBEventHandler } from "../utils/VBEventHandler";
import { UIUtils } from "../utils/UIUtils";

@Component({
    selector: "list",
    template: "",
})
export abstract class AbstractList {

    @ViewChild('blockDivList') public blockDivElement: ElementRef; //the element in the view referenced with #blockDivList
    abstract viewChildrenNode: QueryList<AbstractListNode>;
    
    @Input() rendering: boolean = true; //if true the nodes in the list should be rendered with the show, with the qname otherwise
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

    /**
     * ATTRIBUTES
     */

    eventSubscriptions: any[] = [];
    abstract list: any[];
    selectedNode: ARTURIResource;

    /**
     * CONSTRUCTOR
     */
    protected eventHandler: VBEventHandler;
    constructor(eventHandler: VBEventHandler) {
        this.eventHandler = eventHandler;
        this.eventSubscriptions.push(eventHandler.refreshDataBroadcastEvent.subscribe(() => this.initList()));
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    abstract initList(): void;

    /**
     * type of the node param depends on the list implementation
     * (for example in instance list it is an object with individual and its class, in scheme list it is simply the scheme)
     */
    abstract selectNode(node: any): void;
    abstract onListNodeCreated(node: ARTURIResource): void;
    abstract onListNodeDeleted(node: ARTURIResource): void;
    abstract openListAt(node: ARTURIResource): void;

    private onNodeSelected(node: ARTURIResource) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAdditionalProperty(ResAttribute.SELECTED);
        }
        this.selectedNode = node;
        this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(node);
    }

}