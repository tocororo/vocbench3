import { Component, Input, Output, ViewChild, QueryList, ElementRef, EventEmitter } from "@angular/core";
import { AbstractNode } from "./abstractNode";
import { ARTResource, ARTURIResource, ARTNode, ResAttribute } from "../models/ARTResources";
import { VBEventHandler } from "../utils/VBEventHandler";

@Component({
    selector: "list-node",
    template: "",
})
export abstract class AbstractListNode extends AbstractNode {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    //get an element in the view referenced with #listNodeElement (useful to apply scrollIntoView in the search function)
    @ViewChild('listNodeElement') listNodeElement: ElementRef;

    /**
     * CONSTRUCTOR
     */
    constructor(eventHandler: VBEventHandler) {
        super(eventHandler);
    }

    /**
     * METHODS
     */

    ngAfterViewInit() {
        //if the resource is new (just created), make it visible in the view
        if (this.node.getAdditionalProperty(ResAttribute.NEW)) {
            this.ensureVisible();
            this.node.deleteAdditionalProperty(ResAttribute.NEW);
        }
    }

    ensureVisible() {
        this.listNodeElement.nativeElement.scrollIntoView({block: 'end', behavior: 'smooth'});
    }

}