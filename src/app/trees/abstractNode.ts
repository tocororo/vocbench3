import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ARTURIResource } from "../models/ARTResources";
import { VBEventHandler } from "../utils/VBEventHandler";

@Component({
    selector: "node",
    template: "",
})
export abstract class AbstractNode {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    @Input() node: ARTURIResource;
    @Input() rendering: boolean; //if true the node be rendered with the show, with the qname otherwise
    @Input() showDeprecated: boolean;
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

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

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    selectNode() {
        this.nodeSelected.emit(this.node);
    }


    //BROADCAST EVENTS HANDLERS

    /**
     * Called when a resource is renamed in resource view.
     * This function replace the uri of the resource contained in the node if it is the resource
     * affected by the renaming.
     */
    onResourceRenamed(oldResource: ARTURIResource, newResource: ARTURIResource) {
        if (oldResource.getURI() == this.node.getURI()) {
            this.node.setURI(newResource.getURI());
        }
    }

}