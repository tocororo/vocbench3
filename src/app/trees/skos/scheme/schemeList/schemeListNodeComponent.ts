import { Component, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList } from "@angular/core";
import { ARTURIResource, ARTResource, ARTLiteral, ResAttribute } from "../../../../models/ARTResources";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { VBContext } from "../../../../utils/VBContext";
import { SkosServices } from "../../../../services/skosServices";

@Component({
    selector: "scheme-list-node",
    templateUrl: "./schemeListNodeComponent.html",
})
export class SchemeListNodeComponent {
    @Input() node: ARTURIResource;
    @Input() rendering: boolean = true; //if true the nodes in the list should be rendered with the show, with the qname otherwise
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

    private eventSubscriptions: any[] = [];

    constructor(private skosService: SkosServices, private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: any) => this.onResourceRenamed(data.oldResource, data.newResource)));
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    /**
     * Called when a node in the tree is clicked. This function emit an event 
     */
    private selectNode() {
        this.nodeSelected.emit(this.node);
    }

    //EVENT LISTENERS

    private onResourceRenamed(oldResource: ARTURIResource, newResource: ARTURIResource) {
        if (oldResource.getURI() == this.node.getURI()) {
            this.node['uri'] = newResource.getURI();
        }
    }

}