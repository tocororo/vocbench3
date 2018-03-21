import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ARTURIResource, ARTResource, ResAttribute } from "../models/ARTResources";
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

        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: any) => this.onResourceRenamed(data.oldResource, data.newResource)));
        this.eventSubscriptions.push(eventHandler.resourceDeprecatedEvent.subscribe(
            (res: ARTResource) => this.onResourceDeprecated(res)));
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
        console.log("comparing", oldResource.getURI(), this.node.getURI());
        if (oldResource.getURI() == this.node.getURI()) {
            console.log("found renamend resource");
            this.node.setURI(newResource.getURI());
            this.node.setAdditionalProperty(ResAttribute.QNAME, newResource.getAdditionalProperty(ResAttribute.QNAME));
            this.node.setShow(newResource.getShow());
        }
    }

    onResourceDeprecated(resource: ARTResource) {
        if (resource instanceof ARTURIResource) {
            if (resource.getURI() == this.node.getURI()) {
                let newNode = this.node.clone();
                newNode.setAdditionalProperty(ResAttribute.DEPRECATED, true);
                //so that the rdfResource component detects the change and update the icon (icon is computed only during the init)
                this.node = newNode;
            }
        }
    }

}