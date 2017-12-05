import { Component, Input, Output, ViewChild, ElementRef, EventEmitter, QueryList } from "@angular/core";
import { AbstractStruct } from "./abstractStruct";
import { AbstractListNode } from "./abstractListNode";
import { ARTURIResource, ResAttribute } from "../models/ARTResources";
import { VBEventHandler } from "../utils/VBEventHandler";

@Component({
    selector: "list",
    template: "",
})
export abstract class AbstractList extends AbstractStruct {

    @ViewChild('blockDivList') public blockDivElement: ElementRef; //the element in the view referenced with #blockDivList
    abstract viewChildrenNode: QueryList<AbstractListNode>;
    
    /**
     * ATTRIBUTES
     */

    list: any[];

    /**
     * CONSTRUCTOR
     */
    constructor(eventHandler: VBEventHandler) {
        super(eventHandler);
    }

    /**
     * METHODS
     */

    init() {
        this.initList();
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

}