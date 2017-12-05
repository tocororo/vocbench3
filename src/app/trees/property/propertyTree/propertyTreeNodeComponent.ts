import { Component, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList, ElementRef } from "@angular/core";
import { PropertyServices } from "../../../services/propertyServices";
import { ARTURIResource, ResAttribute, ResourceUtils } from "../../../models/ARTResources";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { AbstractTreeNode } from "../../abstractTreeNode";

@Component({
    selector: "property-tree-node",
    templateUrl: "./propertyTreeNodeComponent.html",
})
export class PropertyTreeNodeComponent extends AbstractTreeNode {

    //PropertyTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(PropertyTreeNodeComponent) viewChildrenNode: QueryList<PropertyTreeNodeComponent>;

    constructor(private propService: PropertyServices, eventHandler: VBEventHandler, basicModals: BasicModalServices) {
        super(eventHandler, basicModals);
        this.eventSubscriptions.push(eventHandler.subPropertyCreatedEvent.subscribe(
            (data: any) => this.onChildCreated(data.superProperty, data.subProperty)));
        this.eventSubscriptions.push(eventHandler.superPropertyAddedEvent.subscribe(
            (data: any) => this.onParentAdded(data.superProperty, data.subProperty)));
        this.eventSubscriptions.push(eventHandler.propertyDeletedEvent.subscribe(
            (property: ARTURIResource) => this.onTreeNodeDeleted(property)));
        this.eventSubscriptions.push(eventHandler.superPropertyRemovedEvent.subscribe(
            (data: any) => this.onParentRemoved(data.superProperty, data.property)));
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: any) => this.onResourceRenamed(data.oldResource, data.newResource)));
    }

    expandNodeImpl() {
        return this.propService.getSubProperties(this.node).map(
            subProps => {
                //sort by show if rendering is active, uri otherwise
                let attribute: "show" | "value" = this.rendering ? "show" : "value";
                ResourceUtils.sortResources(subProps, attribute);
                this.node.setAdditionalProperty(ResAttribute.CHILDREN, subProps); //append the retrieved node as child of the expanded node
                this.open = true;
            }
        );
    }

}