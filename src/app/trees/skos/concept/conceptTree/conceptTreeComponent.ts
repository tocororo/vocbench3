import { Component, Input, Output, EventEmitter, ViewChildren, QueryList, SimpleChanges } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum, ResourceUtils } from "../../../../models/ARTResources";
import { VBProperties } from "../../../../utils/VBProperties";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { UIUtils } from "../../../../utils/UIUtils";
import { AuthorizationEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { SkosServices } from "../../../../services/skosServices";
import { SearchServices } from "../../../../services/searchServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { ConceptTreeNodeComponent } from "./conceptTreeNodeComponent";
import { AbstractTree } from "../../../abstractTree";

@Component({
    selector: "concept-tree",
    templateUrl: "./conceptTreeComponent.html",
    host: { class: "blockingDivHost" }
})
export class ConceptTreeComponent extends AbstractTree {

    @Input() schemes: ARTURIResource[];
    // @Input() schemeChangeable: boolean = false;//if true, on top of tree there is a menu that allows to change scheme dynamically
    @Output() conceptRemovedFromScheme = new EventEmitter<ARTURIResource>();//used to report a concept removed from a scheme
    //only when the scheme is the one used in the current concept tree

    //ConceptTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;

    //in case of search that returns concept not in the current active scheme, if the user activates the scheme which the concept belongs
    //it could be necessary wait that the tree is initialized again (with the new scheme) and so it performs multiple attempts to expand the 
    //path to the searched concept
    private searchRetryAttempt: number;

    constructor(private skosService: SkosServices, private searchService: SearchServices, private basicModals: BasicModalServices,
        private vbProp: VBProperties, eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.topConceptCreatedEvent.subscribe(
            (data: {concept: ARTURIResource, schemes: ARTURIResource[]}) => this.onTopConceptCreated(data.concept, data.schemes)));
        this.eventSubscriptions.push(eventHandler.conceptDeletedEvent.subscribe(
            (deletedConcept: ARTURIResource) => this.onTreeNodeDeleted(deletedConcept)));
        this.eventSubscriptions.push(eventHandler.conceptRemovedFromSchemeEvent.subscribe(
            (data: any) => this.onConceptRemovedFromScheme(data.concept, data.scheme)));
        this.eventSubscriptions.push(eventHandler.conceptRemovedAsTopConceptEvent.subscribe(
            (data: any) => this.onConceptRemovedFromScheme(data.concept, data.scheme)));
    }

    /**
     * Listener on changes of @Input scheme. When it changes, update the tree
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes['schemes']) {
            this.initTree();
        }
    }

    initTree() {
        if (!AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SKOS_GET_CONCEPT_TAXONOMY)) {
            return;
        }

        this.roots = [];
        this.selectedNode = null;
        this.rootLimit = this.initialRoots;

        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.skosService.getTopConcepts(this.schemes).subscribe( //new service (whithout lang param)
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
        let schemes: ARTURIResource[];
        if (this.vbProp.getSearchSettings().restrictActiveScheme) {
            schemes = this.schemes;
        }
        this.searchService.getPathFromRoot(node, RDFResourceRolesEnum.concept, schemes).subscribe(
            path => {
                if (path.length == 0) {
                    this.basicModals.alert("Search", "Node " + node.getShow() + " is not reachable in the current tree");
                    return;
                };
                //open tree from root to node
                //first ensure that the first element of the path is not excluded by the paging mechanism
                this.ensureRootVisibility(path[0]);
                //apply timeout in order to wait that the children node is rendered (in case the visibile roots have been increased)
                setTimeout(() => { 
                    this.searchRetryAttempt = 0;
                    this.openRoot(path, node); 
                });
            }
        );
    }

    private openRoot(path: ARTURIResource[], node: ARTURIResource) {
        var childrenNodeComponent = this.viewChildrenNode.toArray();
        for (var i = 0; i < childrenNodeComponent.length; i++) {//looking for first node (root) to expand
            if (childrenNodeComponent[i].node.getURI() == path[0].getURI()) {
                //let the found node expand itself and the remaining path
                path.splice(0, 1);
                childrenNodeComponent[i].expandPath(path);
                return;
            }
        }
        //if this line is reached, the searched node is not in childrenNodeComponent,
        //it could be not reachable or not yet ready (after a scheme change)
        setTimeout(() => { 
            this.searchRetryAttempt++;
            if (this.searchRetryAttempt > 20) { //after 20 attempts (20*300ms) stop searching
                this.basicModals.alert("Search", "Node " + node.getShow() + " is not reachable in the current tree");
            }
            this.ensureRootVisibility(path[0]);
            this.openRoot(path, node); 
        }, 300); //try again after 300ms
    }

    //EVENT LISTENERS

    private onTopConceptCreated(concept: ARTURIResource, schemes: ARTURIResource[]) {
        if (this.schemes == undefined) {//in no-scheme mode add to the root if it isn't already in
            if (!ResourceUtils.containsNode(this.roots, concept)) {
                this.roots.push(concept);
            }
        } else { //otherwise add the top concept only if it is added in a scheme currently active in the tree
            if (this.schemes != null) {
                for (var i = 0; i < schemes.length; i++) {
                    if (ResourceUtils.containsNode(this.schemes, schemes[i])) {
                        this.roots.push(concept);
                        break;
                    }
                }
            }
        }
    }

    //data contains "concept" and "scheme"
    private onConceptRemovedFromScheme(concept: ARTURIResource, scheme: ARTURIResource) {
        /**
         * TODO: a concept is removed from a scheme, but I don't know if it is still in another scheme active.
         * E.g.
         * Schemes: S1, S2 (both visible)
         * Concept: C (in both S1 and S2)
         * C is removed from S1 but it should be still visible because is in S2 but I have not this info here. 
         * I just know that "concept" has been removed from "scheme".
         * Decide what to do, at the moment a refresh is required in order to see the updated tree
         */
        // if (this.scheme != undefined && this.scheme.getURI() == scheme.getURI()) {
        //     for (var i = 0; i < this.roots.length; i++) {
        //         if (this.roots[i].getURI() == concept.getURI()) {
        //             this.roots.splice(i, 1);
        //             this.conceptRemovedFromScheme.emit(concept);
        //             break;
        //         }
        //     }
        // }
    }

}