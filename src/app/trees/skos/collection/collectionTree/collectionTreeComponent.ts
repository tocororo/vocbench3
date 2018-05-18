import { Component, Input, Output, EventEmitter, ViewChildren, QueryList } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum, ResourceUtils, SortAttribute } from "../../../../models/ARTResources";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { UIUtils } from "../../../../utils/UIUtils";
import { AuthorizationEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { SkosServices } from "../../../../services/skosServices";
import { SearchServices } from "../../../../services/searchServices";
import { CollectionTreeNodeComponent } from "./collectionTreeNodeComponent";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { AbstractTree } from "../../../abstractTree";

@Component({
    selector: "collection-tree",
    templateUrl: "./collectionTreeComponent.html",
    host: { class: "blockingDivHost" }
})
export class CollectionTreeComponent extends AbstractTree {

    //CollectionTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(CollectionTreeNodeComponent) viewChildrenNode: QueryList<CollectionTreeNodeComponent>;

    constructor(private skosService: SkosServices, private searchService: SearchServices, private basicModals: BasicModalServices,
        eventHandler: VBEventHandler) {

        super(eventHandler);

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
    }

    initTree() {
        if (!AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SKOS_GET_COLLECTION_TAXONOMY)) {
            return;
        }

        // this.roots = []; //Don't know why, this throws an ExpressionChangedAfterItHasBeenCheckedError while the same code works fine in other trees
        this.selectedNode = null;
        this.rootLimit = this.initialRoots;

        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.skosService.getRootCollections().subscribe( //new service
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
        this.searchService.getPathFromRoot(node, RDFResourceRolesEnum.skosCollection).subscribe(
            path => {
                if (path.length == 0) {
                    this.basicModals.alert("Search", "Node " + node.getShow() + " is not reachable in the current tree", "warning");
                    return;
                };
                
                //open tree from root to node

                //first ensure that the first element of the path is not excluded by the paging mechanism
                this.ensureRootVisibility(path[0], path);

                setTimeout( //apply timeout in order to wait that the children node is rendered (in case the visibile roots have been increased)
                    () => {
                        var childrenNodeComponent = this.viewChildrenNode.toArray();
                        for (var i = 0; i < childrenNodeComponent.length; i++) {//looking for first node (root) to expand
                            if (childrenNodeComponent[i].node.getURI() == path[0].getURI()) {
                                //let the found node expand itself and the remaining path
                                path.splice(0, 1);
                                childrenNodeComponent[i].expandPath(path);
                                return;
                            }
                        }
                        //if this line is reached it means that the first node of the path has not been found
                        this.basicModals.alert("Search", "Node " + node.getShow() + " is not reachable in the current tree", "warning");
                    }
                );
            }
        );
    }

    //EVENT LISTENERS

    private onRootCollectionCreated(collection: ARTURIResource) {
        // this.roots.push(collection);
        this.roots.unshift(collection);
    }

    private onNestedCollectionAdded(nested: ARTURIResource, container: ARTURIResource) {
        //if the nested was a root collection, then remove it from root (since it is no more a root by definition)
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getNominalValue() == nested.getURI()) {
                this.roots.splice(i, 1);
                break;
            }
        }
    }

}