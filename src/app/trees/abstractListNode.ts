import { Component, Input, Output, ViewChild, QueryList, ElementRef, EventEmitter } from "@angular/core";
import { ARTResource, ARTURIResource, ARTNode, ResAttribute } from "../models/ARTResources";
import { VBEventHandler } from "../utils/VBEventHandler";

@Component({
    selector: "list-node",
    templateUrl: "./owl/instanceList/instanceListNodeComponent.html",
})
export abstract class AbstractListNode {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    @Input() node: ARTURIResource;
    @Input() rendering: boolean; //if true the node be rendered with the show, with the qname otherwise
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

    //get an element in the view referenced with #listNodeElement (useful to apply scrollIntoView in the search function)
    @ViewChild('listNodeElement') listNodeElement: ElementRef;

    eventSubscriptions: any[] = [];

    /**
     * CONSTRUCTOR
     */
    protected eventHandler: VBEventHandler;
    constructor(eventHandler: VBEventHandler) {
        this.eventHandler = eventHandler;
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

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    selectNode() {
        this.nodeSelected.emit(this.node);
    }

    ensureVisible() {
        this.listNodeElement.nativeElement.scrollIntoView({block: 'end', behavior: 'smooth'});
    }

    //BROADCAST EVENTS HANDLERS

    /**
     * Called when a resource is renamed in resource view.
     * This function replace the uri of the resource contained in the node if it is the resource
     * affected by the renaming.
     */
    onResourceRenamed(oldResource: ARTURIResource, newResource: ARTURIResource) {
        if (oldResource.getURI() == this.node.getURI()) {
            // this.node[ResAttribute.SHOW] = newResource.getShow();
            this.node.setURI(newResource.getURI());
        }
    }

}