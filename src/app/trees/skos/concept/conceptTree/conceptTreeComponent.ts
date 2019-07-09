import { Component, EventEmitter, Input, Output, QueryList, SimpleChanges, ViewChildren } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../../models/ARTResources";
import { ConceptTreePreference, ConceptTreeVisualizationMode } from "../../../../models/Properties";
import { SearchServices } from "../../../../services/searchServices";
import { SkosServices } from "../../../../services/skosServices";
import { AuthorizationEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { VBRequestOptions } from "../../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../../utils/ResourceUtils";
import { UIUtils } from "../../../../utils/UIUtils";
import { VBActionsEnum } from "../../../../utils/VBActions";
import { VBContext } from "../../../../utils/VBContext";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../../../widget/modal/sharedModal/sharedModalServices";
import { AbstractTree } from "../../../abstractTree";
import { ConceptTreeNodeComponent } from "./conceptTreeNodeComponent";

@Component({
    selector: "concept-tree",
    templateUrl: "./conceptTreeComponent.html",
    host: { class: "treeListComponent" }
})
export class ConceptTreeComponent extends AbstractTree {

    @Input() schemes: ARTURIResource[];
    @Output() conceptRemovedFromScheme = new EventEmitter<ARTURIResource>();//used to report a concept removed from a scheme
    //only when the scheme is the one used in the current concept tree

    //ConceptTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;

    structRole = RDFResourceRolesEnum.concept;

    constructor(private skosService: SkosServices, private searchService: SearchServices,
        eventHandler: VBEventHandler, basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(eventHandler, basicModals, sharedModals);
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
            this.init();
        }
    }

    initImpl() {
        if (!AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetConceptTaxonomy)) {
            return;
        }

        let conceptTreePreference: ConceptTreePreference = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().conceptTreePreferences;
        
        if (conceptTreePreference.visualization == ConceptTreeVisualizationMode.hierarchyBased) {
            let broaderProps: ARTURIResource[] = [];
            conceptTreePreference.broaderProps.forEach((prop: string) => broaderProps.push(new ARTURIResource(prop)));
            let narrowerProps: ARTURIResource[] = [];
            conceptTreePreference.narrowerProps.forEach((prop: string) => narrowerProps.push(new ARTURIResource(prop)));
            let includeSubProps: boolean = conceptTreePreference.includeSubProps;

            UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
            this.skosService.getTopConcepts(this.schemes, broaderProps, narrowerProps, includeSubProps, VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe( //new service (whithout lang param)
                topConcepts => {
                    //sort by show if rendering is active, uri otherwise
                    ResourceUtils.sortResources(topConcepts, this.rendering ? SortAttribute.show : SortAttribute.value);
                    this.roots = topConcepts;
                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);

                    if (this.pendingSearchPath) {
                        this.openRoot(this.pendingSearchPath);
                    }
                }
            );
        } else if (conceptTreePreference.visualization == ConceptTreeVisualizationMode.searchBased) {
            //don't do nothing
        }
    }

    public forceList(list: ARTURIResource[]) {
        this.setInitialStatus();
        this.roots = list;
    }

    openTreeAt(node: ARTURIResource) {
        this.searchService.getPathFromRoot(node, RDFResourceRolesEnum.concept, this.schemes, null, VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
            path => {
                if (path.length == 0) {
                    this.onTreeNodeNotFound(node);
                };
                //open tree from root to node
                this.openRoot(path); 
            }
        );
    }

    /**
     * Expand the given "path" in order to reach "node" starting from the root.
     * This method could be invoked also from the parent panel for selecting an advanced search result in search-based mode.
     * @param path 
     * @param node 
     */
    openRoot(path: ARTURIResource[]) {
        if (this.ensureRootVisibility(path[0], path)) { //if root is visible
            setTimeout(() => { //wait the the UI is updated after the (possible) update of rootLimit
                UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
                var childrenNodeComponent = this.viewChildrenNode.toArray();
                for (var i = 0; i < childrenNodeComponent.length; i++) {//looking for first node (root) to expand
                    if (childrenNodeComponent[i].node.getURI() == path[0].getURI()) {
                        //let the found node expand itself and the remaining path
                        path.splice(0, 1);
                        childrenNodeComponent[i].expandPath(path);
                        UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                        return;
                    }
                }
            });
        }
    }

    //EVENT LISTENERS

    private onTopConceptCreated(concept: ARTURIResource, schemes: ARTURIResource[]) {
        if (this.schemes == undefined) {//in no-scheme mode add to the root if it isn't already in
            if (!ResourceUtils.containsNode(this.roots, concept)) {
                // this.roots.push(concept);
                this.roots.unshift(concept);
            }
        } else { //otherwise add the top concept only if it is added in a scheme currently active in the tree
            if (this.schemes != null) {
                for (var i = 0; i < schemes.length; i++) {
                    if (ResourceUtils.containsNode(this.schemes, schemes[i])) {
                        this.roots.unshift(concept);
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