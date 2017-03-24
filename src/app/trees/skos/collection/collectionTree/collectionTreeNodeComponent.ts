import { Component, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList, ElementRef } from "@angular/core";
import { ARTURIResource, ARTResource, ResAttribute, ResourceUtils } from "../../../../models/ARTResources";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { VocbenchCtx } from "../../../../utils/VocbenchCtx";
import { SkosServices } from "../../../../services/skosServices";
import { AbstractTreeNode } from "../../../abstractTreeNode";

@Component({
    selector: "collection-tree-node",
    templateUrl: "./collectionTreeNodeComponent.html",
})
export class CollectionTreeNodeComponent extends AbstractTreeNode {

    //CollectionTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(CollectionTreeNodeComponent) viewChildrenNode: QueryList<CollectionTreeNodeComponent>;

    constructor(private skosService: SkosServices, private vbCtx: VocbenchCtx, eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.collectionDeletedEvent.subscribe(
            (deletedCollection: ARTResource) => this.onCollectionDeleted(deletedCollection)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionCreatedEvent.subscribe(
            (data: any) => this.onNestedCollectionCreated(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedEvent.subscribe(
            (data: any) => this.onNestedCollectionCreated(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedFirstEvent.subscribe(
            (data: any) => this.onNestedCollectionAddedFirst(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedLastEvent.subscribe(
            (data: any) => this.onNestedCollectionAddedLast(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedInPositionEvent.subscribe(
            (data: any) => this.onNestedCollectionAddedInPosition(data.nested, data.container, data.position)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionRemovedEvent.subscribe(
            (data: any) => this.onNestedCollectionRemoved(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: any) => this.onResourceRenamed(data.oldResource, data.newResource)));
        this.eventSubscriptions.push(eventHandler.skosPrefLabelSetEvent.subscribe(
            (data: any) => this.onPrefLabelSet(data.resource, data.label, data.lang)));
        this.eventSubscriptions.push(eventHandler.skosxlPrefLabelSetEvent.subscribe(
            (data: any) => this.onPrefLabelSet(data.resource, data.label, data.lang)));
        this.eventSubscriptions.push(eventHandler.skosPrefLabelRemovedEvent.subscribe(
            (data: any) => this.onPrefLabelRemoved(data.resource, data.label, data.lang)));
        this.eventSubscriptions.push(eventHandler.skosxlPrefLabelRemovedEvent.subscribe(
            (data: any) => this.onPrefLabelRemoved(data.resource, data.label, data.lang)));
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
                let attribute: "show" | "uri" = this.rendering ? "show" : "uri";
                ResourceUtils.sortURIResources(nestedColl, attribute);
                this.node.setAdditionalProperty(ResAttribute.CHILDREN, nestedColl); //append the retrieved node as child of the expanded node
                this.node.setAdditionalProperty(ResAttribute.OPEN, true);
                this.nodeExpandEnd.emit();
            }
        );
    }

    //EVENT LISTENERS

    private onCollectionDeleted(deletedCollection: ARTResource) {
        var children = this.node.getAdditionalProperty(ResAttribute.CHILDREN);
        for (var i = 0; i < children.length; i++) {
            if (children[i].getURI() == deletedCollection.getNominalValue()) {
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

    private onNestedCollectionCreated(nested: ARTURIResource, container: ARTURIResource) {
        //add the new collection as children only if the container is the current collection
        if (this.node.getURI() == container.getURI()) {
            this.node.getAdditionalProperty(ResAttribute.CHILDREN).push(nested);
            this.node.setAdditionalProperty(ResAttribute.MORE, 1);
            this.node.setAdditionalProperty(ResAttribute.OPEN, true);
        }
    }

    private onNestedCollectionAddedFirst(nested: ARTURIResource, container: ARTURIResource) {
        //add the new collection as children only if the container is the current collection
        if (this.node.getURI() == container.getURI()) {
            this.node.getAdditionalProperty(ResAttribute.CHILDREN).unshift(nested);
            this.node.setAdditionalProperty(ResAttribute.MORE, 1);
            this.node.setAdditionalProperty(ResAttribute.OPEN, true);
        }
    }

    private onNestedCollectionAddedLast(nested: ARTURIResource, container: ARTURIResource) {
        //add the new collection as children only if the container is the current collection
        if (this.node.getURI() == container.getURI()) {
            this.node.getAdditionalProperty(ResAttribute.CHILDREN).push(nested);
            this.node.setAdditionalProperty(ResAttribute.MORE, 1);
            this.node.setAdditionalProperty(ResAttribute.OPEN, true);
        }
    }

    private onNestedCollectionAddedInPosition(nested: ARTURIResource, container: ARTURIResource, position: number) {
        //add the new collection as children only if the container is the current collection
        if (this.node.getURI() == container.getURI()) {
            this.node.getAdditionalProperty(ResAttribute.CHILDREN).splice(position, 0, nested);
            this.node.setAdditionalProperty(ResAttribute.MORE, 1);
            this.node.setAdditionalProperty(ResAttribute.OPEN, true);
        }
    }

    private onNestedCollectionRemoved(nested: ARTURIResource, container: ARTURIResource) {
        //remove the nested collection from children only if the container is the current collection
        if (this.node.getURI() == container.getURI()) {
            this.onCollectionDeleted(nested);
        }
    }

    private onResourceRenamed(oldResource: ARTURIResource, newResource: ARTURIResource) {
        if (oldResource.getURI() == this.node.getURI()) {
            this.node['uri'] = newResource.getURI();
        }
    }

    private onPrefLabelSet(resource: ARTURIResource, label: string, lang: string) {
        /**
         * the following code is commented since the show of a resource is computed by the server according to the languages preference
         * and there is no way update the show after a pref label is set
         */
        // if (this.rendering && this.vbCtx.getContentLanguage() == lang && resource.getURI() == this.node.getURI()) {
        //     this.node['show'] = label;
        // }
    }

    private onPrefLabelRemoved(resource: ARTURIResource, label: string, lang: string) {
        /**
         * the following code is commented since the getShow() service, that is used to update the show of the concept,
         * gets as parameter just one language instead of an array of lang representing all the language that are used currently
         */
        // if (this.rendering && this.vbCtx.getContentLanguage() == lang && resource.getURI() == this.node.getURI()) {
        //     this.skosService.getShow(resource, this.vbCtx.getContentLanguage()).subscribe(
        //         show => {
        //             this.node['show'] = show;
        //         }
        //     )
        // }
    }

}