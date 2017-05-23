import { Component, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList, ElementRef, SimpleChanges } from "@angular/core";
import { ARTURIResource, ResAttribute, ResourceUtils } from "../../../../models/ARTResources";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { VBContext } from "../../../../utils/VBContext";
import { SkosServices } from "../../../../services/skosServices";
import { AbstractTreeNode } from "../../../abstractTreeNode";

@Component({
    selector: "concept-tree-node",
    templateUrl: "./conceptTreeNodeComponent.html",
})
export class ConceptTreeNodeComponent extends AbstractTreeNode {

    @Input() schemes: ARTURIResource[];

    //ConceptTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;

    constructor(private skosService: SkosServices, eventHandler: VBEventHandler) {
        super(eventHandler);
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

    /**
 	 * Function called when "+" button is clicked.
 	 * Gets a node as parameter and retrieve with an http call the narrower of the node,
 	 * then expands the subtree div.
 	 */
    expandNode() {
        this.nodeExpandStart.emit();
        this.skosService.getNarrowerConcepts(this.node, this.schemes).subscribe(
            narrower => {
                //sort by show if rendering is active, uri otherwise
                let attribute: "show" | "value" = this.rendering ? "show" : "value";
                ResourceUtils.sortResources(narrower, attribute);
                //append the retrieved node as child of the expanded node
                this.node.setAdditionalProperty(ResAttribute.CHILDREN, narrower);
                this.open = true;
                this.nodeExpandEnd.emit();
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

    private onPrefLabelSet(resource: ARTURIResource, label: string, lang: string) {
        /**
         * the following code is commented since the show of a resource is computed by the server according to the languages preference
         * and there is no way update the show after a pref label is set
         */
        // if (this.rendering && VBContext.getContentLanguage() == lang && resource.getURI() == this.node.getURI()) {
        //     this.node['show'] = label;
        // }
    }

    private onPrefLabelRemoved(resource: ARTURIResource, label: string, lang: string) {
        /**
         * the following code is commented since the getShow() service, that is used to update the show of the concept,
         * gets as parameter just one language instead of an array of lang representing all the language that are used currently
         */
        // if (this.rendering && VBContext.getContentLanguage() == lang && resource.getURI() == this.node.getURI()) {
        //     this.skosService.getShow(resource, VBContext.getContentLanguage()).subscribe(
        //         show => {
        //             this.node['show'] = show;
        //         }
        //     )
        // }
    }

}