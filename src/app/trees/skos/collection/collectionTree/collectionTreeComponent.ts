import { Component, Input, Output, EventEmitter, ViewChildren, QueryList } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../../models/ARTResources";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { VocbenchCtx } from "../../../../utils/VocbenchCtx";
import { ResourceUtils } from "../../../../utils/ResourceUtils";
import { SkosServices } from "../../../../services/skosServices";
import { SearchServices } from "../../../../services/searchServices";
import { CollectionTreeNodeComponent } from "./collectionTreeNodeComponent";
import { ModalServices } from "../../../../widget/modal/modalServices";
import { AbstractTree } from "../../../abstractTree";

@Component({
    selector: "collection-tree",
    templateUrl: "./collectionTreeComponent.html",
    host: { class: "blockingDivHost" }
})
export class CollectionTreeComponent extends AbstractTree {

    //CollectionTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(CollectionTreeNodeComponent) viewChildrenNode: QueryList<CollectionTreeNodeComponent>;

    constructor(private skosService: SkosServices, private searchService: SearchServices, private modalService: ModalServices,
        private vbCtx: VocbenchCtx, eventHandler: VBEventHandler) {

        super(eventHandler);

        this.eventSubscriptions.push(eventHandler.rootCollectionCreatedEvent.subscribe(
            (newColl: ARTURIResource) => this.onRootCollectionCreated(newColl)));
        this.eventSubscriptions.push(eventHandler.collectionDeletedEvent.subscribe(
            (deletedCollection: ARTURIResource) => this.onCollectionDeleted(deletedCollection)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedEvent.subscribe(
            (data: any) => this.onNestedCollectionAdded(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedFirstEvent.subscribe(
            (data: any) => this.onNestedCollectionAdded(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedLastEvent.subscribe(
            (data: any) => this.onNestedCollectionAdded(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedInPositionEvent.subscribe(
            (data: any) => this.onNestedCollectionAdded(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.contentLangChangedEvent.subscribe(
            (newLang: string) => this.onContentLangChanged(newLang)));
    }

    initTree() {
        this.blockDivElement.nativeElement.style.display = "block";
        this.skosService.getRootCollections().subscribe( //new service
            rootColl => {
                //sort by show if rendering is active, uri otherwise
                let attribute: "show" | "uri" = this.rendering ? "show" : "uri";
                ResourceUtils.sortURIResources(rootColl, attribute);
                this.roots = rootColl;
                this.blockDivElement.nativeElement.style.display = "none";
            },
            err => { this.blockDivElement.nativeElement.style.display = "none"; }
        );
    }

    doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.skosCollection], true, true, "contain",
                this.vbCtx.getContentLanguage(true)).subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.openTreeAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                (selectedResource: any) => {
                                    this.openTreeAt(selectedResource);
                                },
                                () => { }
                            );
                        }
                    }
                }
                );
        }
    }

    openTreeAt(node: ARTURIResource) {
        this.searchService.getPathFromRoot(node, RDFResourceRolesEnum.skosCollection).subscribe(
            path => {
                var childrenNodeComponent = this.viewChildrenNode.toArray();
                //open tree from root to node
                for (var i = 0; i < childrenNodeComponent.length; i++) {//looking for first node (root) to expand
                    if (childrenNodeComponent[i].node.getURI() == path[0].getURI()) {
                        //let the found node expand itself and the remaining path
                        path.splice(0, 1);
                        childrenNodeComponent[i].expandPath(path);
                        break;
                    }
                }
            }
        );
    }

    //EVENT LISTENERS

    private onRootCollectionCreated(collection: ARTURIResource) {
        this.roots.push(collection);
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

    private onCollectionDeleted(deletedCollection: ARTURIResource) {
        //check if the collection to delete is a root
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getNominalValue() == deletedCollection.getNominalValue()) {
                this.roots.splice(i, 1);
                break;
            }
        }
        //reset the selected node
        this.nodeSelected.emit(undefined);
    }

    private onContentLangChanged(lang: string) {
        //reset the selected node
        this.nodeSelected.emit(undefined);
        //and reinitialize tree
        this.initTree();
    }

}