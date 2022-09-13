import { ChangeDetectorRef, Component, Input, QueryList, ViewChildren } from "@angular/core";
import { map } from 'rxjs/operators';
import { ARTURIResource, ResAttribute } from "../../../models/ARTResources";
import { ConceptTreePreference, MultischemeMode } from "../../../models/Properties";
import { SkosServices } from "../../../services/skosServices";
import { VBRequestOptions } from "../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { VBContext } from "../../../utils/VBContext";
import { ConceptDeleteUndoData, VBEventHandler } from "../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { AbstractTreeNode } from "../abstractTreeNode";

@Component({
    selector: "concept-tree-node",
    templateUrl: "./conceptTreeNodeComponent.html",
})
export class ConceptTreeNodeComponent extends AbstractTreeNode {

    @Input() schemes: ARTURIResource[];

    //ConceptTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;

    constructor(private skosService: SkosServices, eventHandler: VBEventHandler,
        basicModals: BasicModalServices, sharedModals: SharedModalServices, changeDetectorRef: ChangeDetectorRef) {
        super(eventHandler, basicModals, sharedModals, changeDetectorRef);
        this.eventSubscriptions.push(eventHandler.conceptDeletedEvent.subscribe(
            (deletedConcept: ARTURIResource) => this.onTreeNodeDeleted(deletedConcept)));
        this.eventSubscriptions.push(eventHandler.narrowerCreatedEvent.subscribe(
            (data: any) => this.onChildCreated(data.broader, data.narrower)));
        this.eventSubscriptions.push(eventHandler.broaderAddedEvent.subscribe(
            (data: any) => this.onParentAdded(data.broader, data.narrower)));
        this.eventSubscriptions.push(eventHandler.conceptRemovedFromSchemeEvent.subscribe(
            (data: any) => this.onConceptRemovedFromScheme(data.concept, data.scheme)));
        this.eventSubscriptions.push(eventHandler.broaderRemovedEvent.subscribe(
            (data: any) => this.onParentRemoved(data.broader, data.concept)));
        this.eventSubscriptions.push(eventHandler.broaderUpdatedEvent.subscribe(
            (data: any) => {
                this.onParentRemoved(data.oldParent, data.child);
                this.onParentAdded(data.newParent, data.child);
            }
        ));
        this.eventSubscriptions.push(eventHandler.conceptDeletedUndoneEvent.subscribe(
            (data: ConceptDeleteUndoData) => this.onDeleteUndo(data)));
    }

    ngOnInit() {
        super.ngOnInit();
    }

    expandNodeImpl() {
        let prefs: ConceptTreePreference = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().conceptTreePreferences;

        let broaderProps: ARTURIResource[] = prefs.broaderProps.map((prop: string) => new ARTURIResource(prop));
        let narrowerProps: ARTURIResource[] = prefs.narrowerProps.map((prop: string) => new ARTURIResource(prop));
        let includeSubProps: boolean = prefs.includeSubProps;

        return this.skosService.getNarrowerConcepts(this.node, this.schemes, prefs.multischemeMode, broaderProps, narrowerProps, 
                includeSubProps, VBRequestOptions.getRequestOptions(this.projectCtx)).pipe(
            map(narrower => {
                //sort by show if rendering is active, uri otherwise
                ResourceUtils.sortResources(narrower, this.rendering ? SortAttribute.show : SortAttribute.value);
                //append the retrieved node as child of the expanded node
                this.children = narrower;
                this.open = true;
                if (this.children.length == 0) {
                    this.open = false;
                    this.node.setAdditionalProperty(ResAttribute.MORE, 0);
                }
            })
        );
    }

    //EVENT LISTENERS

    private onConceptRemovedFromScheme(concept: ARTURIResource, scheme: ARTURIResource) {
        //See comment in onConceptRemovedFromScheme in conceptTreeComponent
        // if (this.scheme != undefined && this.scheme.getURI() == scheme.getURI()) {
        //     this.onConceptDeleted(concept);
        // }
    }

    private onDeleteUndo(data: ConceptDeleteUndoData) {
        if (data.parents.length == 0) return; //has no broaders, so the concept to restore is a top concept
        if (this.schemes == null || this.schemes.length == 0) { //no scheme mode => no check on scheme, simply add to roots
            if (data.parents.some(b => b.equals(this.node))) {
                this.onChildCreated(this.node, data.resource);
            }
        } else {
            if (data.parents.some(b => b.equals(this.node))) {
                let visible: boolean;
                let multischemeMode = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().conceptTreePreferences.multischemeMode;
                if (multischemeMode == MultischemeMode.or) { //concept to restore is visible if it belongs to at least one active scheme
                    data.schemes.forEach(s => {
                        if (this.schemes.some(activeSc => activeSc.equals(s))) {
                            visible = true;
                        }
                    });
                } else { //mode AND, visible if belongs to every active scheme
                    visible = true;
                    this.schemes.forEach(actSc => {
                        if (!data.schemes.some(s => s.equals(actSc))) {
                            visible = false; //there is an active scheme which concept doesn't belong
                        }
                    });
                }
                if (visible) {
                    this.onChildCreated(this.node, data.resource);
                }
            }
        }
    }

}