import { Component, ElementRef, EventEmitter, Input, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from "@angular/core";
import { Observable, of } from "rxjs";
import { flatMap } from 'rxjs/operators';
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { ConceptTreePreference, ConceptTreeVisualizationMode, MultischemeMode, SafeToGo, SafeToGoMap } from "../../../models/Properties";
import { SearchServices } from "../../../services/searchServices";
import { SkosServices } from "../../../services/skosServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { VBRequestOptions } from "../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { TreeListContext, UIUtils } from "../../../utils/UIUtils";
import { VBActionsEnum } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { AbstractTree } from "../abstractTree";
import { ConceptTreeNodeComponent } from "./conceptTreeNodeComponent";

@Component({
    selector: "concept-tree",
    templateUrl: "./conceptTreeComponent.html",
    host: { class: "treeListComponent" }
})
export class ConceptTreeComponent extends AbstractTree {
    @Input() schemes: ARTURIResource[];
    @Output() conceptRemovedFromScheme = new EventEmitter<ARTURIResource>();//used to report a concept removed from a scheme only when the scheme is the one used in the current concept tree
    @Output() requireSettings = new EventEmitter<void>(); //requires to the parent panel to open/change settings
    

    //ConceptTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;

    structRole = RDFResourceRolesEnum.concept;

    private safeToGoLimit: number;
    safeToGo: SafeToGo = { safe: true };

    /*
     * when the tree is initialized multiple time in a short amount of time (e.g. when the scheme is changed and then immediately changed again)
     * it might happened that the first initialization request takes more time than the last, so the response of the first is reveived after
     * the last. In this way, the tree is initialized with the wrong response (the first instead of the last).
     * This variable is useful in order to keep trace of the last request and to take in account only the related response ignoring the others.
     */
    private lastInitTimestamp: number;

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
        this.eventSubscriptions.push(eventHandler.multischemeModeChangedEvent.subscribe(
            () => this.init() //multischeme mode changed => reinit tree
        ));
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
            this.lastInitTimestamp = new Date().getTime();
            this.checkInitializationSafe().subscribe(
                () => {
                    if (this.safeToGo.safe) {
                        let conceptTreePreference: ConceptTreePreference = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().conceptTreePreferences;
                        let broaderProps: ARTURIResource[] = conceptTreePreference.broaderProps.map((prop: string) => new ARTURIResource(prop));
                        let narrowerProps: ARTURIResource[] = conceptTreePreference.narrowerProps.map((prop: string) => new ARTURIResource(prop));
                        let includeSubProps: boolean = conceptTreePreference.includeSubProps;
                        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
                        this.skosService.getTopConcepts(this.lastInitTimestamp, this.schemes, conceptTreePreference.multischemeMode,
                            broaderProps, narrowerProps, includeSubProps, VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
                            data => {
                                if (data.timestamp != this.lastInitTimestamp) { //the response is not about the last getTopConcepts request
                                    return; //=> ignore it
                                }
                                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                                let topConcepts = data.concepts;
                                //sort by show if rendering is active, uri otherwise
                                ResourceUtils.sortResources(topConcepts, this.rendering ? SortAttribute.show : SortAttribute.value);
                                this.roots = topConcepts;
                                if (this.pendingSearchPath) {
                                    this.openRoot(this.pendingSearchPath);
                                }
                            }
                        );
                    }
                }   
            )
        } else if (conceptTreePreference.visualization == ConceptTreeVisualizationMode.searchBased) {
            //don't do nothing
        }
    }

    /**
     * Forces the safeness of the structure even if it was reported as not safe, then re initialize it
     */
    private forceSafeness() {
        this.safeToGo.safe = true;
        let conceptTreePreference: ConceptTreePreference = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().conceptTreePreferences;
        let safeToGoMap: SafeToGoMap = conceptTreePreference.safeToGoMap;
        let checksum = this.getInitRequestChecksum();
        safeToGoMap[checksum] = this.safeToGo;
        this.initImpl();
    }

    /**
     * Perform a check in order to prevent the initialization of the structure with too many elements
     * Return true if the initialization is safe or if the user agreed to init the structure anyway
     */
    private checkInitializationSafe(): Observable<void> {
        let conceptTreePreference: ConceptTreePreference = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().conceptTreePreferences;
        let multischemeMode: MultischemeMode = conceptTreePreference.multischemeMode;
        let broaderProps: ARTURIResource[] = conceptTreePreference.broaderProps.map((prop: string) => new ARTURIResource(prop));
        let narrowerProps: ARTURIResource[] = conceptTreePreference.narrowerProps.map((prop: string) => new ARTURIResource(prop));
        let includeSubProps: boolean = conceptTreePreference.includeSubProps;
        let safeToGoMap: SafeToGoMap = conceptTreePreference.safeToGoMap;
        this.safeToGoLimit = conceptTreePreference.safeToGoLimit;

        let checksum = this.getInitRequestChecksum();

        let safeness: SafeToGo = safeToGoMap[checksum];
        if (safeness != null) { //found safeness in cache
            this.safeToGo = safeness;
            return of(null)
        } else { //never initialized => count
            UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
            return this.skosService.countTopConcepts(this.lastInitTimestamp, this.schemes, multischemeMode, broaderProps, narrowerProps, includeSubProps, VBRequestOptions.getRequestOptions(this.projectCtx)).pipe(
                flatMap(data => {
                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                    let safeness = { safe: data.count < this.safeToGoLimit, count: data.count }; 
                    safeToGoMap[checksum] = safeness; //cache the safeness
                    if (data.timestamp != this.lastInitTimestamp) { //a newest request has been performed => stop this initialization
                        return of(null)
                    }
                    this.safeToGo = safeness;
                    return of(null)
                })
            );
        }
    }

    private getInitRequestChecksum() {
        let conceptTreePreference: ConceptTreePreference = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().conceptTreePreferences;
        let multischemeMode: MultischemeMode = conceptTreePreference.multischemeMode;
        let broaderProps: ARTURIResource[] = conceptTreePreference.broaderProps.map((prop: string) => new ARTURIResource(prop));
        let narrowerProps: ARTURIResource[] = conceptTreePreference.narrowerProps.map((prop: string) => new ARTURIResource(prop));
        let includeSubProps: boolean = conceptTreePreference.includeSubProps;
        let checksum = "schemes:" + this.schemes.map(s => s.toNT()).join(",") + 
            "&multischemeMode:" + multischemeMode + 
            "&broaderProps:" + broaderProps + 
            "&narrowerProps:" + narrowerProps + 
            "&includeSubProps:" + includeSubProps;
        return checksum;
    }

    public forceList(list: ARTURIResource[]) {
        this.safeToGo = { safe: true }; //prevent the list not showing if a previous hierarchy initialization set the safeToGo to false
        this.setInitialStatus();
        this.roots = list;
    }

    openTreeAt(node: ARTURIResource) {
        let conceptTreePreference: ConceptTreePreference = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().conceptTreePreferences;
        let multischemeMode: MultischemeMode = conceptTreePreference.multischemeMode;
        let broaderProps: ARTURIResource[] = conceptTreePreference.broaderProps.map((prop: string) => new ARTURIResource(prop));
        let narrowerProps: ARTURIResource[] = conceptTreePreference.narrowerProps.map((prop: string) => new ARTURIResource(prop));
        let includeSubProps: boolean = conceptTreePreference.includeSubProps;
        this.searchService.getPathFromRoot(node, RDFResourceRolesEnum.concept, this.schemes, multischemeMode, broaderProps, narrowerProps, includeSubProps, null, 
            VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
            path => {
                if (path.length == 0) {
                    this.onTreeNodeNotFound(node);
                    return;
                };
                //open tree from root to node
                this.openRoot(path); 
            }
        );
    }

    //EVENT LISTENERS

    private onTopConceptCreated(concept: ARTURIResource, schemes: ARTURIResource[]) {
        if (this.schemes == undefined) {//in no-scheme mode add to the root if it isn't already in
            if (!ResourceUtils.containsNode(this.roots, concept)) {
                this.roots.unshift(concept);
                if (this.context == TreeListContext.addPropValue) {
                    this.openRoot([concept]);
                }
            }
        } else { //otherwise add the top concept only if it is added in a scheme currently active in the tree
            if (this.schemes != null) {
                for (var i = 0; i < schemes.length; i++) {
                    if (ResourceUtils.containsNode(this.schemes, schemes[i])) {
                        this.roots.unshift(concept);
                        if (this.context == TreeListContext.addPropValue) {
                            this.openRoot([concept]);
                        }
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