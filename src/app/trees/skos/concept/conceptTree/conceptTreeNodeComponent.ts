import { Component, Input, QueryList, ViewChildren } from "@angular/core";
import { ARTURIResource, ResAttribute, ResourceUtils, SortAttribute } from "../../../../models/ARTResources";
import { ConceptTreePreference } from "../../../../models/Properties";
import { SkosServices } from "../../../../services/skosServices";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { VBProperties } from "../../../../utils/VBProperties";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../../../widget/modal/sharedModal/sharedModalServices";
import { AbstractTreeNode } from "../../../abstractTreeNode";

@Component({
    selector: "concept-tree-node",
    templateUrl: "./conceptTreeNodeComponent.html",
})
export class ConceptTreeNodeComponent extends AbstractTreeNode {

    @Input() schemes: ARTURIResource[];

    //ConceptTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;

    constructor(private skosService: SkosServices, private vbProp: VBProperties, eventHandler: VBEventHandler,
        basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(eventHandler, basicModals, sharedModals);
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
    }

    expandNodeImpl() {
        let prefs: ConceptTreePreference = this.vbProp.getConceptTreePreferences();
        let broaderProps: ARTURIResource[] = [];
        prefs.broaderProps.forEach((prop: string) => broaderProps.push(new ARTURIResource(prop)));
        let narrowerProps: ARTURIResource[] = [];
        prefs.narrowerProps.forEach((prop: string) => narrowerProps.push(new ARTURIResource(prop)));
        let includeSubProps: boolean = prefs.includeSubProps;

        return this.skosService.getNarrowerConcepts(this.node, this.schemes, broaderProps, narrowerProps, includeSubProps).map(
            narrower => {
                //sort by show if rendering is active, uri otherwise
                ResourceUtils.sortResources(narrower, this.rendering ? SortAttribute.show : SortAttribute.value);
                //append the retrieved node as child of the expanded node
                this.children = narrower;
                this.open = true;
            }
        );
    }

    //EVENT LISTENERS

    private onConceptRemovedFromScheme(concept: ARTURIResource, scheme: ARTURIResource) {
        //TODO See comment in onConceptRemovedFromScheme in conceptTreeComponent
        // if (this.scheme != undefined && this.scheme.getURI() == scheme.getURI()) {
        //     this.onConceptDeleted(concept);
        // }
    }

}