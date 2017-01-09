import {Component, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList, ElementRef} from "@angular/core";
import {ARTURIResource, ARTResource, ResAttribute} from "../../../../utils/ARTResources";
import {VBEventHandler} from "../../../../utils/VBEventHandler";
import {VocbenchCtx} from "../../../../utils/VocbenchCtx";
import {SkosServices} from "../../../../services/skosServices";

@Component({
	selector: "collection-tree-node",
	templateUrl: "./collectionTreeNodeComponent.html",
})
export class CollectionTreeNodeComponent {
    @Input() node: ARTURIResource;
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    @Output() nodeExpandStart = new EventEmitter<any>(); //emit an event when the user click on button to expand a subTree of a node
    @Output() nodeExpandEnd = new EventEmitter<any>(); //emit an event when the subTree expansion is completed
    
    //get an element in the view referenced with #treeNodeElement (useful to apply scrollIntoView in the search function)
    @ViewChild('treeNodeElement') treeNodeElement: ElementRef;

    //CollectionTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(CollectionTreeNodeComponent) viewChildrenNode: QueryList<CollectionTreeNodeComponent>;
    
    //structure to support the tree opening
    private pendingSearch: any = {
        pending: false, //tells if there is a pending search waiting that children view are initialized 
        path: [], //remaining path of the tree to open
    }
    
    private eventSubscriptions: any[] = [];
    
	constructor(private skosService:SkosServices, private eventHandler:VBEventHandler, private vbCtx: VocbenchCtx) {
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
    
    ngAfterViewInit() {
        //when CollectionTreeNodeComponent children are added, looks for a pending search to resume
        this.viewChildrenNode.changes.subscribe(
            c => {
                if (this.pendingSearch.pending) {//there is a pending search
                    /* setTimeout to trigger a new round of change detection avoid an exception due to changes in a lifecycle hook
                    (see https://github.com/angular/angular/issues/6005#issuecomment-165911194) */
                    window.setTimeout(() =>
                        this.expandPath(this.pendingSearch.path)
                    );
                }
            });
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    /**
     * Expand recursively the given path untill the final node.
     * If the given path is empty then the current node is the searched one, otherwise
     * the current node expands itself (if is closed), looks among its children for the following node of the path,
     * then call recursively expandPath() for the child node.
     */
    public expandPath(path: ARTURIResource[]) {
        if (path.length == 0) { //this is the last node of the path. Focus it in the tree
            this.treeNodeElement.nativeElement.scrollIntoView();
            //not sure if it has to be selected (this method could be used in some scenarios where there's no need to select the node)
            if (!this.node.getAdditionalProperty(ResAttribute.SELECTED)) { //select the searched node only if is not yet selected
                this.selectNode();    
            }
        } else {
            if (!this.node.getAdditionalProperty(ResAttribute.OPEN)) { //if node is close, expand itself
                this.expandNode();
            }
            var nodeChildren = this.viewChildrenNode.toArray();
            if (nodeChildren.length == 0) {//Still no children CollectionTreeNodeComponent (view not yet initialized)
                //save pending search so it can resume when the children are initialized
                this.pendingSearch.pending = true;
                this.pendingSearch.path = path;
            } else if (this.pendingSearch.pending) {
                //the tree expansion is resumed, reset the pending search
                this.pendingSearch.pending = false;
                this.pendingSearch.path = [];
            }
            for (var i = 0; i < nodeChildren.length; i++) {//for every CollectionTreeNodeComponent child
                if (nodeChildren[i].node.getURI() == path[0].getURI()) { //look for the next node of the path
                    //let the child node expand the remaining path
                    path.splice(0, 1);
                    nodeChildren[i].expandPath(path);
                    break;
                }
            }
        }
    }
    
    /**
 	 * Function called when "+" button is clicked.
 	 * Gets a node as parameter and retrieve with an http call the narrower of the node,
 	 * then expands the subtree div.
 	 */
    public expandNode() {
        this.nodeExpandStart.emit();
        // this.skosService.getNestedCollections(this.node, this.vbCtx.getContentLanguage(true)).subscribe( //old service
        this.skosService.getNestedCollections(this.node).subscribe( //new service
            nestedColl => {
                this.node.setAdditionalProperty(ResAttribute.CHILDREN, nestedColl); //append the retrieved node as child of the expanded node
                this.node.setAdditionalProperty(ResAttribute.OPEN, true);
                this.nodeExpandEnd.emit();
            }
        );
    }
    
    /**
   	 * Collapse the subtree div.
   	 */
    private collapseNode() {
		this.node.setAdditionalProperty(ResAttribute.OPEN, false);
        this.node.setAdditionalProperty(ResAttribute.CHILDREN, []);
    }
    
    /**
     * Called when a node in the tree is clicked. This function emit an event 
     */
    private selectNode() {
        this.nodeSelected.emit(this.node);
    }
    
    //EVENT LISTENERS
    
    private onNodeSelected(node: ARTURIResource) {
        this.nodeSelected.emit(node);
    }
    
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
            if (this.vbCtx.getHumanReadable()) {
                this.skosService.getShow(newResource, this.vbCtx.getContentLanguage()).subscribe(
                    show => {
                        this.node['show'] = show;
                        this.node['uri'] = newResource.getURI();
                    }
                )
            } else {//human readable disabled, just replace the show (localName)
                this.node['show'] = newResource.getShow();
                this.node['uri'] = newResource.getURI();
            }
        }
    }
    
    private onPrefLabelSet(resource: ARTURIResource, label: string, lang: string) {
        if (this.vbCtx.getHumanReadable() && this.vbCtx.getContentLanguage() == lang && resource.getURI() == this.node.getURI()) {
            this.node['show'] = label;
        }
    }
    
    private onPrefLabelRemoved(resource: ARTURIResource, label: string, lang: string) {
        if (this.vbCtx.getHumanReadable() && this.vbCtx.getContentLanguage() == lang && resource.getURI() == this.node.getURI()) {
            this.skosService.getShow(resource, this.vbCtx.getContentLanguage()).subscribe(
                show => {
                    this.node['show'] = show;
                }
            )
        }
    }

    //Listeners to node expansion start/end. Simply forward the event to the parent
    private onNodeExpandStart() {
        this.nodeExpandStart.emit();
    }
    private onNodeExpandEnd() {
        this.nodeExpandEnd.emit();
    }
    
}