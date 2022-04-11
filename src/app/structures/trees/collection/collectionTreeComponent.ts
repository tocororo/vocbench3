import { Component, QueryList, ViewChildren } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { SearchServices } from "../../../services/searchServices";
import { SkosServices } from "../../../services/skosServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { VBRequestOptions } from "../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { TreeListContext, UIUtils } from "../../../utils/UIUtils";
import { VBActionsEnum } from "../../../utils/VBActions";
import { TreeNodeDeleteUndoData, VBEventHandler } from "../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { AbstractTree } from "../abstractTree";
import { CollectionTreeNodeComponent } from "./collectionTreeNodeComponent";

@Component({
    selector: "collection-tree",
    templateUrl: "./collectionTreeComponent.html",
    host: { class: "treeListComponent" }
})
export class CollectionTreeComponent extends AbstractTree {
    //CollectionTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(CollectionTreeNodeComponent) viewChildrenNode: QueryList<CollectionTreeNodeComponent>;

    structRole = RDFResourceRolesEnum.skosCollection;

    constructor(private skosService: SkosServices, private searchService: SearchServices, 
        eventHandler: VBEventHandler, basicModals: BasicModalServices, sharedModals: SharedModalServices) {

        super(eventHandler, basicModals, sharedModals);

        this.eventSubscriptions.push(eventHandler.rootCollectionCreatedEvent.subscribe(
            (newColl: ARTURIResource) => this.onRootCollectionCreated(newColl)));
        this.eventSubscriptions.push(eventHandler.collectionDeletedEvent.subscribe(
            (deletedCollection: ARTURIResource) => this.onTreeNodeDeleted(deletedCollection)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedEvent.subscribe(
            (data: any) => this.onNestedCollectionAdded(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedFirstEvent.subscribe(
            (data: any) => this.onNestedCollectionAdded(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedLastEvent.subscribe(
            (data: any) => this.onNestedCollectionAdded(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedInPositionEvent.subscribe(
            (data: any) => this.onNestedCollectionAdded(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.collectionDeletedUndoneEvent.subscribe(
            (data: TreeNodeDeleteUndoData) => this.onDeleteUndo(data)));
    }

    initImpl() {
        if (!AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetCollectionTaxonomy)) {
            this.unauthorized = true;
            return;
        }

        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.skosService.getRootCollections(VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe( //new service
            rootColl => {
                //sort by show if rendering is active, uri otherwise
                ResourceUtils.sortResources(rootColl, this.rendering ? SortAttribute.show : SortAttribute.value);
                this.roots = rootColl;
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
            },
            err => { UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement); }
        );
    }

    openTreeAt(node: ARTURIResource) {
        this.searchService.getPathFromRoot(node, RDFResourceRolesEnum.skosCollection, null, null, null, null, null, null,
            VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
            path => {
                if (path.length == 0) {
                    this.onTreeNodeNotFound(node);
                    return;
                }
                //open tree from root to node
                this.openRoot(path); 
            }
        );
    }

    //EVENT LISTENERS

    private onRootCollectionCreated(collection: ARTURIResource) {
        this.roots.unshift(collection);
        if (this.context == TreeListContext.addPropValue) {
            this.openRoot([collection]);
        }
    }

    private onNestedCollectionAdded(nested: ARTURIResource, container: ARTURIResource) {
        //if the nested was a root collection, then remove it from root (since it is no more a root by definition)
        for (let i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getNominalValue() == nested.getURI()) {
                this.roots.splice(i, 1);
                break;
            }
        }
    }

    private onDeleteUndo(data: TreeNodeDeleteUndoData) {
        if (data.parents.length == 0) {
            this.onRootCollectionCreated(data.resource);   
        }
    }

}