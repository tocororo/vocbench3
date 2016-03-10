import {Component, Input, Output, EventEmitter, ViewChildren, QueryList} from "angular2/core";
import {ARTURIResource} from "../../../utils/ARTResources";
import {VBEventHandler} from "../../../utils/VBEventHandler";
import {SkosServices} from "../../../services/skosServices";
import {SearchServices} from "../../../services/searchServices";
import {ConceptTreeNodeComponent} from "./conceptTreeNodeComponent";

@Component({
    selector: "concept-tree",
    templateUrl: "app/src/skos/concept/conceptTree/conceptTreeComponent.html",
    directives: [ConceptTreeNodeComponent],
    providers: [SkosServices, SearchServices],
    host: { class: "blockingDivHost" }
})
export class ConceptTreeComponent {
    @Input() scheme: ARTURIResource;
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    //ConceptTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;

    public roots: ARTURIResource[];
    private selectedNode: ARTURIResource;

    private eventSubscriptions = [];

    constructor(private skosService: SkosServices, private searchService: SearchServices, private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.topConceptCreatedEvent.subscribe(
            data => this.onTopConceptCreated(data.concept, data.scheme)));
        this.eventSubscriptions.push(eventHandler.conceptDeletedEvent.subscribe(
            deletedConcept => this.onConceptDeleted(deletedConcept)));
        this.eventSubscriptions.push(eventHandler.conceptRemovedFromSchemeEvent.subscribe(
            data => this.onConceptRemovedFromScheme(data.concept, data.scheme)));
        this.eventSubscriptions.push(eventHandler.conceptRemovedAsTopConceptEvent.subscribe(
            data => this.onConceptRemovedFromScheme(data.concept, data.scheme)));
    }
    
    ngOnInit() {
        document.getElementById("blockDivTree").style.display = "block";
        this.skosService.getTopConcepts(this.scheme).subscribe(
            topConcepts => {
                this.roots = topConcepts;
            },
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            },
            () => document.getElementById("blockDivTree").style.display = "none"
        );
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    public openTreeAt(node: ARTURIResource) {
        this.searchService.getPathFromRoot(node, "concept", this.scheme).subscribe(
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
            this.selectedNode.setAdditionalProperty("selected", true);
        } else {
            this.selectedNode.deleteAdditionalProperty("selected");
            this.selectedNode = node;
            this.selectedNode.setAdditionalProperty("selected", true);
        }
        this.itemSelected.emit(node);
    }

    private onTopConceptCreated(concept: ARTURIResource, scheme: ARTURIResource) {
        if (this.scheme == undefined) {//in no-scheme mode add always to the roots
            this.roots.push(concept);
        } else if (this.scheme.getURI() == scheme.getURI()) {//otherwise add it only if it's been created in the current scheme 
            this.roots.push(concept);       
        }
    }

    private onConceptDeleted(deletedConcept: ARTURIResource) {
        //check if the concept to delete is a root
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == deletedConcept.getURI()) {
                this.roots.splice(i, 1);
                break;
            }
        }
        //reset the selected item
        this.itemSelected.emit(undefined);
    }
    
    //data contains "concept" and "scheme"
    private onConceptRemovedFromScheme(concept: ARTURIResource, scheme: ARTURIResource) {
        if (this.scheme != undefined && this.scheme.getURI() == scheme.getURI()) {
            this.onConceptDeleted(concept);
        }
    }

}