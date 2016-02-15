import {Component, Input, Output, EventEmitter, ViewChildren, QueryList} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {Deserializer} from "../../utils/Deserializer";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {SkosServices} from "../../services/skosServices";
import {OntoSearchServices} from "../../services/ontoSearchServices";
import {ConceptTreeNodeComponent} from "./conceptTreeNodeComponent";

@Component({
    selector: "concept-tree",
    templateUrl: "app/src/tree/conceptTree/conceptTreeComponent.html",
    directives: [ConceptTreeNodeComponent],
    providers: [SkosServices, OntoSearchServices],
})
export class ConceptTreeComponent {
    @Input() scheme: ARTURIResource;
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    //ConceptTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;

    public roots: ARTURIResource[];
    private selectedNode: ARTURIResource;

    private eventSubscriptions = [];

    constructor(private skosService: SkosServices, private searchService: OntoSearchServices, 
            private deserializer: Deserializer, private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.conceptTreeNodeSelectedEvent.subscribe(
            concept => this.onConceptSelected(concept)));
        this.eventSubscriptions.push(eventHandler.topConceptCreatedEvent.subscribe(
            concept => this.onTopConceptCreated(concept)));
        this.eventSubscriptions.push(eventHandler.conceptDeletedEvent.subscribe(
            concept => this.onConceptDeleted(concept)));
        this.eventSubscriptions.push(eventHandler.conceptRemovedFromSchemeEvent.subscribe(
            data => this.onConceptRemovedFromScheme(data)));
        this.eventSubscriptions.push(eventHandler.conceptRemovedAsTopConceptEvent.subscribe(
            data => this.onConceptRemovedFromScheme(data)));
    }
    
    ngOnInit() {
        var schemeUri = null;
        if (this.scheme != undefined) {
            schemeUri = this.scheme.getURI();
        }
        this.skosService.getTopConcepts(schemeUri)
            .subscribe(
                stResp => {
                    this.roots = this.deserializer.createRDFArray(stResp);
                    for (var i = 0; i < this.roots.length; i++) {
                        this.roots[i].setAdditionalProperty("children", []);
                    }
                },
                err => {
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    public openTreeAt(node: ARTURIResource) {
        this.searchService.getPathFromRoot(node.getURI(), this.scheme.getURI()).subscribe(
            //at the moment the response is not parsable with the Deserializer, in the future
            //the service will be refactored according to the <uri> xml serialization format
            stResp => {
                var path = new Array<ARTURIResource>();
                var conceptElemColl = stResp.getElementsByTagName("concept");
                for (var i=0; i<conceptElemColl.length; i++) {
                    var show = conceptElemColl[i].getAttribute("show");
                    var uri = conceptElemColl[i].textContent;
                    path.push(new ARTURIResource(uri, show, "concept"));
                }
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
    
    private onConceptSelected(node: ARTURIResource) {
        if (this.selectedNode == undefined) {
            this.selectedNode = node;
            this.selectedNode.setAdditionalProperty("selected", true);
        } else if (this.selectedNode.getURI() != node.getURI()) {
            this.selectedNode.deleteAdditionalProperty("selected");
            this.selectedNode = node;
            this.selectedNode.setAdditionalProperty("selected", true);
        }
        this.itemSelected.emit(node);
    }

    private onTopConceptCreated(concept: ARTURIResource) {
        this.roots.push(concept);
    }

    private onConceptDeleted(concept: ARTURIResource) {
        //check if the concept to delete is a root
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == concept.getURI()) {
                this.roots.splice(i, 1);
                break;
            }
        }
        //reset the selected item
        this.itemSelected.emit(undefined);
    }
    
    //data contains "concept" and "scheme"
    private onConceptRemovedFromScheme(data) {
        var scheme = data.scheme;
        if (this.scheme != undefined && this.scheme.getURI() == scheme.getURI()) {
            var concept = data.concept;
            this.onConceptDeleted(concept);
        }
    }

}