import {Component, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList} from "@angular/core";
import {ARTURIResource, ResAttribute} from "../../../utils/ARTResources";
import {VBEventHandler} from "../../../utils/VBEventHandler";
import {VocbenchCtx} from "../../../utils/VocbenchCtx";
import {SkosServices} from "../../../services/skosServices";
import {RdfResourceComponent} from "../../../widget/rdfResource/rdfResourceComponent";

@Component({
	selector: "concept-tree-node",
	templateUrl: "app/src/skos/concept/conceptTree/conceptTreeNodeComponent.html",
    directives: [RdfResourceComponent, ConceptTreeNodeComponent],
    providers: [SkosServices],
})
export class ConceptTreeNodeComponent {
    @Input() node: ARTURIResource;
    @Input() scheme: ARTURIResource;
    @Output() nodeClicked = new EventEmitter<ARTURIResource>();
    @Output() nodeCtrlClicked = new EventEmitter<ARTURIResource>();
    
    //get an element in the view referenced with #treeNodeElement (useful to apply scrollIntoView in the search function)
    @ViewChild('treeNodeElement') treeNodeElement;
    //ConceptTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;
    //structure to support the tree opening
    private pendingSearch = {
        pending: false, //tells if there is a pending search waiting that children view are initialized 
        path: [], //remaining path of the tree to open
    }
    
    private eventSubscriptions = [];
    
	constructor(private skosService:SkosServices, private eventHandler:VBEventHandler, private vbCtx: VocbenchCtx) {
        this.eventSubscriptions.push(eventHandler.conceptDeletedEvent.subscribe(
            deletedConcept => this.onConceptDeleted(deletedConcept)));
        this.eventSubscriptions.push(eventHandler.narrowerCreatedEvent.subscribe(
            data => this.onNarrowerCreated(data.narrower, data.broader)));
        this.eventSubscriptions.push(eventHandler.broaderAddedEvent.subscribe(
            data => this.onBroaderAdded(data.narrower, data.broader)));
        this.eventSubscriptions.push(eventHandler.conceptRemovedFromSchemeEvent.subscribe(
            data => this.onConceptRemovedFromScheme(data.concept, data.scheme)));
        this.eventSubscriptions.push(eventHandler.broaderRemovedEvent.subscribe(
            data => this.onBroaderRemoved(data.concept, data.broader)));
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            data => this.onResourceRenamed(data.oldResource, data.newResource)));
        this.eventSubscriptions.push(eventHandler.skosPrefLabelSetEvent.subscribe(
            data => this.onPrefLabelSet(data.resource, data.label, data.lang)));
        this.eventSubscriptions.push(eventHandler.skosxlPrefLabelSetEvent.subscribe(
            data => this.onPrefLabelSet(data.resource, data.label, data.lang)));
        this.eventSubscriptions.push(eventHandler.skosPrefLabelRemovedEvent.subscribe(
            data => this.onPrefLabelRemoved(data.resource, data.label, data.lang)));
        this.eventSubscriptions.push(eventHandler.skosxlPrefLabelRemovedEvent.subscribe(
            data => this.onPrefLabelRemoved(data.resource, data.label, data.lang)));
    }
    
    ngAfterViewInit() {
        //when ConceptTreeNodeComponent children are added, looks for a pending search to resume
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
            if (nodeChildren.length == 0) {//Still no children ConceptTreeNodeComponent (view not yet initialized)
                //save pending search so it can resume when the children are initialized
                this.pendingSearch.pending = true;
                this.pendingSearch.path = path;
            } else if (this.pendingSearch.pending) {
                //the tree expansion is resumed, reset the pending search
                this.pendingSearch.pending = false;
                this.pendingSearch.path = [];
            }
            for (var i = 0; i < nodeChildren.length; i++) {//for every ConceptTreeNodeComponent child
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
        this.skosService.getNarrowerConcepts(this.node, this.scheme, this.vbCtx.getContentLanguage(true)).subscribe(
            narrower => {
                this.node.setAdditionalProperty(ResAttribute.CHILDREN, narrower); //append the retrieved node as child of the expanded node
                this.node.setAdditionalProperty(ResAttribute.OPEN, true);
            }
        );
    }
    
    /**
   	 * Function called when "-" button is clicked.
   	 * Collapse the subtree div.
   	 */
    private collapseNode() {
		this.node.setAdditionalProperty(ResAttribute.OPEN, false);
        this.node.setAdditionalProperty(ResAttribute.CHILDREN, []);
    }
    
    /**
     * Called when a rdf-resource is clicked. 
     */
    private onResourceClicked(event: MouseEvent) {
        if (event.ctrlKey) { //ctrl + click
            this.nodeCtrlClicked.emit(this.node);
        } else {
            this.selectNode();
        }
    }

    private selectNode() {
        this.nodeClicked.emit(this.node);
    }
    
    //EVENT LISTENERS
    
    private onNodeClicked(node: ARTURIResource) {
        this.nodeClicked.emit(node);
    }

    private onNodeCtrlClicked(node: ARTURIResource) {
        this.nodeCtrlClicked.emit(node);
    }

    private onConceptDeleted(deletedConcept: ARTURIResource) {
        var children = this.node.getAdditionalProperty(ResAttribute.CHILDREN);
        for (var i = 0; i < children.length; i++) {
            if (children[i].getURI() == deletedConcept.getURI()) {
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
    
    private onNarrowerCreated(narrower: ARTURIResource, broader: ARTURIResource) {
        //add the new concept as children only if the parent is the current concept
        if (this.node.getURI() == broader.getURI()) {
            this.node.getAdditionalProperty(ResAttribute.CHILDREN).push(narrower);
            this.node.setAdditionalProperty(ResAttribute.MORE, 1);
            this.node.setAdditionalProperty(ResAttribute.OPEN, true);
        }
    }

    private onBroaderAdded(narrower: ARTURIResource, broader: ARTURIResource) {
        if (this.node.getURI() == broader.getURI()) {//if the broader is the current node
            this.node.setAdditionalProperty(ResAttribute.MORE, 1); //update more
            //if it was open add the narrower to the visible children
            if (this.node.getAdditionalProperty(ResAttribute.OPEN)) { 
                this.node.getAdditionalProperty(ResAttribute.CHILDREN).push(narrower); 
            }
        }
    }
    
    private onConceptRemovedFromScheme(concept: ARTURIResource, scheme: ARTURIResource) {
        if (this.scheme != undefined && this.scheme.getURI() == scheme.getURI()) {
            this.onConceptDeleted(concept);
        }
    }
    
    private onBroaderRemoved(concept: ARTURIResource, broader: ARTURIResource) {
        if (broader.getURI() == this.node.getURI()) {
            this.onConceptDeleted(concept);
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
    
}