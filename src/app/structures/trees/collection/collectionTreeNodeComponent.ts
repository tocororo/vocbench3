import { ChangeDetectorRef, Component, QueryList, ViewChildren } from "@angular/core";
import { map } from 'rxjs/operators';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../../../models/ARTResources";
import { SkosServices } from "../../../services/skosServices";
import { VBRequestOptions } from "../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { TreeNodeDeleteUndoData, VBEventHandler } from "../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { AbstractTreeNode } from "../abstractTreeNode";

@Component({
    selector: "collection-tree-node",
    templateUrl: "./collectionTreeNodeComponent.html",
})
export class CollectionTreeNodeComponent extends AbstractTreeNode {

    //CollectionTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(CollectionTreeNodeComponent) viewChildrenNode: QueryList<CollectionTreeNodeComponent>;

    constructor(private skosService: SkosServices, eventHandler: VBEventHandler, 
        basicModals: BasicModalServices, sharedModals: SharedModalServices, changeDetectorRef: ChangeDetectorRef) {
        super(eventHandler, basicModals, sharedModals, changeDetectorRef);
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
        this.eventSubscriptions.push(eventHandler.collectionDeletedUndoneEvent.subscribe(
            (data: TreeNodeDeleteUndoData) => this.onDeleteUndo(data)));
    }

    ngOnInit() {
        super.ngOnInit();
    }

    expandNodeImpl() {
        return this.skosService.getNestedCollections(this.node, VBRequestOptions.getRequestOptions(this.projectCtx)).pipe(
            map(nestedColl => {
                if (this.node.getRole() != RDFResourceRolesEnum.skosOrderedCollection) { //orderedCollection sorted server-side
                    //sort by show if rendering is active, uri otherwise
                    ResourceUtils.sortResources(nestedColl, this.rendering ? SortAttribute.show : SortAttribute.value);
                }
                this.children = nestedColl;
                this.open = true;
                if (this.children.length == 0) {
                    this.open = false;
                    this.node.setAdditionalProperty(ResAttribute.MORE, 0);
                }
            })
        );
    }

    //EVENT LISTENERS

    private onNestedCollectionAddedFirst(nested: ARTURIResource, container: ARTURIResource) {
        //add the new collection as children only if the container is the current collection
        if (this.node.getURI() == container.getURI()) {
            this.children.unshift(nested);
            this.node.setAdditionalProperty(ResAttribute.MORE, 1);
            this.open = true;
        }
    }

    private onNestedCollectionAddedLast(nested: ARTURIResource, container: ARTURIResource) {
        //add the new collection as children only if the container is the current collection
        if (this.node.getURI() == container.getURI()) {
            this.children.push(nested);
            this.node.setAdditionalProperty(ResAttribute.MORE, 1);
            this.open = true;
        }
    }

    private onNestedCollectionAddedInPosition(nested: ARTURIResource, container: ARTURIResource, position: number) {
        //add the new collection as children only if the container is the current collection
        if (this.node.getURI() == container.getURI()) {
            this.children.splice(position, 0, nested);
            this.node.setAdditionalProperty(ResAttribute.MORE, 1);
            this.open = true;
        }
    }

    private onDeleteUndo(data: TreeNodeDeleteUndoData) {
        if (data.parents.some(p => p.equals(this.node))) {
            this.onChildCreated(this.node, data.resource);   
        }
    }

}