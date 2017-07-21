import { Component, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList, ElementRef } from "@angular/core";
import { ARTURIResource, ARTResource, ARTLiteral, ResAttribute, ResourceUtils } from "../../../../models/ARTResources";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { SkosServices } from "../../../../services/skosServices";
import { AbstractTreeNode } from "../../../abstractTreeNode";

@Component({
    selector: "collection-tree-node",
    templateUrl: "./collectionTreeNodeComponent.html",
})
export class CollectionTreeNodeComponent extends AbstractTreeNode {

    //CollectionTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(CollectionTreeNodeComponent) viewChildrenNode: QueryList<CollectionTreeNodeComponent>;

    constructor(private skosService: SkosServices, eventHandler: VBEventHandler, basicModals: BasicModalServices) {
        super(eventHandler, basicModals);
        this.eventSubscriptions.push(eventHandler.collectionDeletedEvent.subscribe(
            (deletedCollection: ARTResource) => this.onTreeNodeDeleted(deletedCollection)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionCreatedEvent.subscribe(
            (data: any) => this.onChildCreated(data.container, data.nested)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedEvent.subscribe(
            (data: any) => this.onChildCreated(data.container, data.nested)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedFirstEvent.subscribe(
            (data: any) => this.onNestedCollectionAddedFirst(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedLastEvent.subscribe(
            (data: any) => this.onNestedCollectionAddedLast(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedInPositionEvent.subscribe(
            (data: any) => this.onNestedCollectionAddedInPosition(data.nested, data.container, data.position)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionRemovedEvent.subscribe(
            (data: any) => this.onParentRemoved(data.container, data.nested)));
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
        this.skosService.getNestedCollections(this.node).subscribe( //new service
            nestedColl => {
                //sort by show if rendering is active, uri otherwise
                let attribute: "show" | "value" = this.rendering ? "show" : "value";
                ResourceUtils.sortResources(nestedColl, attribute);
                this.node.setAdditionalProperty(ResAttribute.CHILDREN, nestedColl); //append the retrieved node as child of the expanded node
                this.open = true;
                this.nodeExpandEnd.emit();
            }
        );
    }

    //EVENT LISTENERS

    private onNestedCollectionAddedFirst(nested: ARTURIResource, container: ARTURIResource) {
        //add the new collection as children only if the container is the current collection
        if (this.node.getURI() == container.getURI()) {
            this.node.getAdditionalProperty(ResAttribute.CHILDREN).unshift(nested);
            this.node.setAdditionalProperty(ResAttribute.MORE, 1);
            this.open = true;
        }
    }

    private onNestedCollectionAddedLast(nested: ARTURIResource, container: ARTURIResource) {
        //add the new collection as children only if the container is the current collection
        if (this.node.getURI() == container.getURI()) {
            this.node.getAdditionalProperty(ResAttribute.CHILDREN).push(nested);
            this.node.setAdditionalProperty(ResAttribute.MORE, 1);
            this.open = true;
        }
    }

    private onNestedCollectionAddedInPosition(nested: ARTURIResource, container: ARTURIResource, position: number) {
        //add the new collection as children only if the container is the current collection
        if (this.node.getURI() == container.getURI()) {
            this.node.getAdditionalProperty(ResAttribute.CHILDREN).splice(position, 0, nested);
            this.node.setAdditionalProperty(ResAttribute.MORE, 1);
            this.open = true;
        }
    }

}