import { Component, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList, ElementRef, SimpleChanges } from "@angular/core";
import { ARTURIResource, ResAttribute } from "../../../../models/ARTResources";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { VocbenchCtx } from "../../../../utils/VocbenchCtx";
import { SkosServices } from "../../../../services/skosServices";
import { AbstractTreeNode } from "../../../abstractTreeNode";
import { ResourceUtils } from "../../../../utils/ResourceUtils";

@Component({
    selector: "concept-tree-node",
    templateUrl: "./conceptTreeNodeComponent.html",
})
export class ConceptTreeNodeComponent extends AbstractTreeNode {

    @Input() scheme: ARTURIResource;

    //ConceptTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;

    constructor(private skosService: SkosServices, private vbCtx: VocbenchCtx, eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.conceptDeletedEvent.subscribe(
            (deletedConcept: ARTURIResource) => this.onConceptDeleted(deletedConcept)));
        this.eventSubscriptions.push(eventHandler.narrowerCreatedEvent.subscribe(
            (data: any) => this.onNarrowerCreated(data.narrower, data.broader)));
        this.eventSubscriptions.push(eventHandler.broaderAddedEvent.subscribe(
            (data: any) => this.onBroaderAdded(data.narrower, data.broader)));
        this.eventSubscriptions.push(eventHandler.conceptRemovedFromSchemeEvent.subscribe(
            (data: any) => this.onConceptRemovedFromScheme(data.concept, data.scheme)));
        this.eventSubscriptions.push(eventHandler.broaderRemovedEvent.subscribe(
            (data: any) => this.onBroaderRemoved(data.concept, data.broader)));
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
        this.skosService.getNarrowerConcepts(this.node, this.scheme).subscribe(
            narrower => {
                //sort by show if rendering is active, uri otherwise
                let attribute: "show" | "uri" = this.rendering ? "show" : "uri";
                ResourceUtils.sortURIResources(narrower, attribute);
                //append the retrieved node as child of the expanded node
                this.node.setAdditionalProperty(ResAttribute.CHILDREN, narrower);
                this.node.setAdditionalProperty(ResAttribute.OPEN, true);
                this.nodeExpandEnd.emit();
            }
        );
    }

    //EVENT LISTENERS

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
            this.node['uri'] = newResource.getURI();
        }
    }

    private onPrefLabelSet(resource: ARTURIResource, label: string, lang: string) {
        /**
         * the following code is commented since the show of a resource is computed by the server according to the languages preference
         * and there is no way update the show after a pref label is set
         */
        // if (this.rendering && this.vbCtx.getContentLanguage() == lang && resource.getURI() == this.node.getURI()) {
        //     this.node['show'] = label;
        // }
    }

    private onPrefLabelRemoved(resource: ARTURIResource, label: string, lang: string) {
        /**
         * the following code is commented since the getShow() service, that is used to update the show of the concept,
         * gets as parameter just one language instead of an array of lang representing all the language that are used currently
         */
        // if (this.rendering && this.vbCtx.getContentLanguage() == lang && resource.getURI() == this.node.getURI()) {
        //     this.skosService.getShow(resource, this.vbCtx.getContentLanguage()).subscribe(
        //         show => {
        //             this.node['show'] = show;
        //         }
        //     )
        // }
    }

}