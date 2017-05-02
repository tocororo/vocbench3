import { Component, Input, Output, EventEmitter, ViewChildren, QueryList, SimpleChanges } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum, ResourceUtils } from "../../../../models/ARTResources";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { UIUtils } from "../../../../utils/UIUtils";
import { SkosServices } from "../../../../services/skosServices";
import { SearchServices } from "../../../../services/searchServices";
import { ModalServices } from "../../../../widget/modal/basicModal/modalServices";
import { ConceptTreeNodeComponent } from "./conceptTreeNodeComponent";
import { AbstractTree } from "../../../abstractTree";

@Component({
    selector: "concept-tree",
    templateUrl: "./conceptTreeComponent.html",
    host: { class: "blockingDivHost" }
})
export class ConceptTreeComponent extends AbstractTree {

    @Input() scheme: ARTURIResource;
    // @Input() schemeChangeable: boolean = false;//if true, on top of tree there is a menu that allows to change scheme dynamically
    @Output() conceptRemovedFromScheme = new EventEmitter<ARTURIResource>();//used to report a concept removed from a scheme
    //only when the scheme is the one used in the current concept tree

    //ConceptTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;

    constructor(private skosService: SkosServices, private searchService: SearchServices, private modalService: ModalServices,
        eventHandler: VBEventHandler) {

        super(eventHandler);

        this.eventSubscriptions.push(eventHandler.topConceptCreatedEvent.subscribe(
            (data: any) => this.onTopConceptCreated(data.concept, data.scheme)));
        this.eventSubscriptions.push(eventHandler.conceptDeletedEvent.subscribe(
            (deletedConcept: ARTURIResource) => this.onConceptDeleted(deletedConcept)));
        this.eventSubscriptions.push(eventHandler.conceptRemovedFromSchemeEvent.subscribe(
            (data: any) => this.onConceptRemovedFromScheme(data.concept, data.scheme)));
        this.eventSubscriptions.push(eventHandler.conceptRemovedAsTopConceptEvent.subscribe(
            (data: any) => this.onConceptRemovedFromScheme(data.concept, data.scheme)));
    }

    /**
     * Listener on changes of @Input scheme. When it changes, update the tree
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes['scheme']) {
            this.initTree();
        }
    }

    initTree() {
        this.roots = [];
        this.selectedNode = null;

        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.skosService.getTopConcepts(this.scheme).subscribe( //new service (whithout lang param)
            topConcepts => {
                //sort by show if rendering is active, uri otherwise
                let attribute: "show" | "value" = this.rendering ? "show" : "value";
                ResourceUtils.sortResources(topConcepts, attribute);
                this.roots = topConcepts;
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
            },
            err => { UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement); }
        );
    }

    openTreeAt(node: ARTURIResource) {
        this.searchService.getPathFromRoot(node, RDFResourceRolesEnum.concept, this.scheme).subscribe(
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

    private onTopConceptCreated(concept: ARTURIResource, scheme: ARTURIResource) {
        if (this.scheme == undefined) {//in no-scheme mode add to the root if doesn't already in
            for (var i = 0; i < this.roots.length; i++) {
                if (this.roots[i].getURI() == concept.getURI()) {
                    return; //concept set as top concept already in roots => do not add
                    //this could happen in no-scheme mode when a concept not in scheme is set as topConcept of a scheme
                }
            }
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
        //reset the selected node
        this.nodeSelected.emit(undefined);
    }

    //data contains "concept" and "scheme"
    private onConceptRemovedFromScheme(concept: ARTURIResource, scheme: ARTURIResource) {
        if (this.scheme != undefined && this.scheme.getURI() == scheme.getURI()) {
            for (var i = 0; i < this.roots.length; i++) {
                if (this.roots[i].getURI() == concept.getURI()) {
                    this.roots.splice(i, 1);
                    this.conceptRemovedFromScheme.emit(concept);
                    break;
                }
            }
        }
    }

}