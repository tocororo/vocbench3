import {Component, Input, Output, EventEmitter, ViewChild, ViewChildren, QueryList} from "@angular/core";
import {ARTURIResource, ResAttribute, RDFResourceRolesEnum} from "../../../utils/ARTResources";
import {VBEventHandler} from "../../../utils/VBEventHandler";
import {VocbenchCtx} from "../../../utils/VocbenchCtx";
import {SkosServices} from "../../../services/skosServices";
import {SearchServices} from "../../../services/searchServices";
import {CollectionTreeNodeComponent} from "./collectionTreeNodeComponent";

@Component({
    selector: "collection-tree",
    templateUrl: "app/src/skos/collection/collectionTree/collectionTreeComponent.html",
    directives: [CollectionTreeNodeComponent],
    providers: [SkosServices, SearchServices],
    host: { class: "blockingDivHost" }
})
export class CollectionTreeComponent {
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    //CollectionTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(CollectionTreeNodeComponent) viewChildrenNode: QueryList<CollectionTreeNodeComponent>;
    
    //get the element in the view referenced with #blockDivTree
    @ViewChild('blockDivTree') blockDivElement;

    public roots: ARTURIResource[];
    private selectedNode: ARTURIResource;
    
    private eventSubscriptions = [];

    constructor(private skosService: SkosServices, private searchService: SearchServices, private eventHandler: VBEventHandler,
        private vbCtx: VocbenchCtx) {
        this.eventSubscriptions.push(eventHandler.rootCollectionCreatedEvent.subscribe(
            newColl => this.onRootCollectionCreated(newColl)));
        this.eventSubscriptions.push(eventHandler.collectionDeletedEvent.subscribe(
            deletedCollection => this.onCollectionDeleted(deletedCollection)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedEvent.subscribe(
            data => this.onNestedCollectionAdded(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedFirstEvent.subscribe(
            data => this.onNestedCollectionAdded(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedLastEvent.subscribe(
            data => this.onNestedCollectionAdded(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.nestedCollectionAddedInPositionEvent.subscribe(
            data => this.onNestedCollectionAdded(data.nested, data.container)));
        this.eventSubscriptions.push(eventHandler.contentLangChangedEvent.subscribe(
            newLang => this.onContentLangChanged(newLang)));
    }
    
    /**
     * Here I use ngAfterViewInit instead of ngOnInit because I need to wait that 
     * the view #blockDivTree is initialized
     */
    ngAfterViewInit() {
        this.initTree();
    }
    
    private initTree() {
        this.blockDivElement.nativeElement.style.display = "block";
        this.skosService.getRootCollections(this.vbCtx.getContentLanguage(true)).subscribe(
            rootColl => {
                this.roots = rootColl;
                this.blockDivElement.nativeElement.style.display = "none";
            },
            err => { this.blockDivElement.nativeElement.style.display = "none"; }
        );
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    public openTreeAt(node: ARTURIResource) {
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
    
    private onNodeSelected(node: ARTURIResource) {
        if (this.selectedNode == undefined) {
            this.selectedNode = node;
            this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true);
        } else {
            this.selectedNode.deleteAdditionalProperty(ResAttribute.SELECTED);
            this.selectedNode = node;
            this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true);
        }
        this.itemSelected.emit(node);
    }

    private onRootCollectionCreated(collection: ARTURIResource) {
        this.roots.push(collection);       
    }

    private onNestedCollectionAdded(nested: ARTURIResource, container: ARTURIResource) {
        //if the nested was a root collection, then remove it from root (since it is no more a root by definition)
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == nested.getURI()) {
                this.roots.splice(i, 1);
                break;
            }
        }
    }

    private onCollectionDeleted(deletedCollection: ARTURIResource) {
        //check if the collection to delete is a root
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == deletedCollection.getURI()) {
                this.roots.splice(i, 1);
                break;
            }
        }
        //reset the selected item
        this.itemSelected.emit(undefined);
    }
    
    private onContentLangChanged(lang: string) {
        //reset the selected item
        this.itemSelected.emit(undefined);
        //and reinitialize tree
        this.initTree();
    }

}