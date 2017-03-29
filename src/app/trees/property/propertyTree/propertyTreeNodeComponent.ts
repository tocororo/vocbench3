import { Component, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList, ElementRef } from "@angular/core";
import { PropertyServices } from "../../../services/propertyServices";
import { ARTURIResource, ResAttribute } from "../../../models/ARTResources";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { AbstractTreeNode } from "../../abstractTreeNode";

@Component({
    selector: "property-tree-node",
    templateUrl: "./propertyTreeNodeComponent.html",
})
export class PropertyTreeNodeComponent extends AbstractTreeNode {

    //PropertyTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(PropertyTreeNodeComponent) viewChildrenNode: QueryList<PropertyTreeNodeComponent>;

    constructor(private propService: PropertyServices, eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.subPropertyCreatedEvent.subscribe(
            (data: any) => this.onSubPropertyCreated(data.subProperty, data.superProperty)));
        this.eventSubscriptions.push(eventHandler.superPropertyAddedEvent.subscribe(
            (data: any) => this.onSuperPropertyAdded(data.subProperty, data.superProperty)));
        this.eventSubscriptions.push(eventHandler.propertyDeletedEvent.subscribe(
            (property: ARTURIResource) => this.onPropertyDeleted(property)));
        this.eventSubscriptions.push(eventHandler.superPropertyRemovedEvent.subscribe(
            (data: any) => this.onSuperPropertyRemoved(data.property, data.superProperty)));
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: any) => this.onResourceRenamed(data.oldResource, data.newResource)));
    }

    /**
 	 * Function called when "+" button is clicked.
 	 * Gets a node as parameter and retrieve with an http call the narrower of the node,
 	 * then expands the subtree div.
 	 */
    expandNode() {
        this.nodeExpandStart.emit();
        this.propService.getSubProperties(this.node).subscribe(
            subProps => {
                this.node.setAdditionalProperty(ResAttribute.CHILDREN, subProps); //append the retrieved node as child of the expanded node
                this.node.setAdditionalProperty(ResAttribute.OPEN, true);
                this.nodeExpandEnd.emit();
            }
        );
    }

    //EVENT LISTENERS

    private onPropertyDeleted(property: ARTURIResource) {
        var children = this.node.getAdditionalProperty(ResAttribute.CHILDREN);
        for (var i = 0; i < children.length; i++) {
            if (children[i].getURI() == property.getURI()) {
                children.splice(i, 1);
                //if node has no more children change info of node so the UI will update
                if (children.length == 0) {
                    this.node.setAdditionalProperty(ResAttribute.MORE, 0);
                    this.node.setAdditionalProperty(ResAttribute.OPEN, false);
                }
                break;
            }
        }
    }

    private onSubPropertyCreated(subProperty: ARTURIResource, superProperty: ARTURIResource) {
        //add the new property as children only if the parent is the current property
        if (this.node.getURI() == superProperty.getURI()) {
            this.node.getAdditionalProperty(ResAttribute.CHILDREN).push(subProperty);
            this.node.setAdditionalProperty(ResAttribute.MORE, 1);
            this.node.setAdditionalProperty(ResAttribute.OPEN, true);
        }
    }

    private onSuperPropertyAdded(subProperty: ARTURIResource, superProperty: ARTURIResource) {
        if (this.node.getURI() == superProperty.getURI()) {//if the superProperty is the current node
            this.node.setAdditionalProperty(ResAttribute.MORE, 1); //update more
            //if it was open add the subProperty to the visible children
            if (this.node.getAdditionalProperty(ResAttribute.OPEN)) {
                this.node.getAdditionalProperty(ResAttribute.CHILDREN).push(subProperty);
            }
        }
    }

    private onSuperPropertyRemoved(property: ARTURIResource, superProperty: ARTURIResource) {
        if (superProperty.getURI() == this.node.getURI()) {
            this.onPropertyDeleted(property);
        }
    }

}