import { Component, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { AlignmentServices } from "../services/alignmentServices";
import { RefactorServices } from "../services/refactorServices";
import { ResourcesServices } from "../services/resourcesServices";
import { ResourceAlignmentModal, ResourceAlignmentModalData } from "../alignment/resourceAlignment/resourceAlignmentModal"
import { CreationModalServices } from "../widget/modal/creationModal/creationModalServices";
import { ARTResource, ARTURIResource, ResAttribute } from "../models/ARTResources";
import { SKOS } from "../models/Vocabulary";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";

@Component({
    selector: "res-view-menu",
    templateUrl: "./resourceViewCtxMenu.html",
})
export class ResourceViewContextMenu {

    @Input() resource: ARTResource;
    @Input() readonly: boolean;
    @Output() update = new EventEmitter();

    constructor(private alignServices: AlignmentServices, private refactorService: RefactorServices,
        private resourcesService: ResourcesServices, private creationModals: CreationModalServices, private modal: Modal) { }

    private alignResource() {
        this.openAlignmentModal().then(
            (data: any) => {
                this.alignServices.addAlignment(this.resource, data.property, data.object).subscribe(
                    stResp => {
                        this.update.emit(this.resource);
                    }
                );
            },
            () => { }
        );
    }

    /**
     * Opens a modal to create an alignment.
     * @return an object containing "property" and "object", namely the mapping property and the 
     * aligned object
     */
    private openAlignmentModal() {
        var modalData = new ResourceAlignmentModalData(this.resource);
        const builder = new BSModalContextBuilder<ResourceAlignmentModalData>(
            modalData, undefined, ResourceAlignmentModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(ResourceAlignmentModal, overlayConfig).then(
            dialog => dialog.result
        );
    }

    private spawnNewConceptWithLabel() {
        this.creationModals.newConceptFromLabel("Spawn new concept", this.resource, SKOS.concept).then(
            data => {
                //from the resView of the xLabel I don't know the concept to which it belongs, 
                //so oldConcept in spawnNewConceptFromLabel request is null and lets the server find the oldConcept
                this.refactorService.spawnNewConceptFromLabel(this.resource, data.schemes, null,
                    data.uriResource, data.broader, data.cfId, data.cfValueMap).subscribe(
                    stResp => {
                        this.update.emit();
                    }
                );
            },
            () => { }
        );
    }

    /**
     * Useful to enable menu item only for URIResource
     */
    private isURIResource() {
        return this.resource.isURIResource();
    }

    private setAsDeprecated() {
        this.resourcesService.setDeprecated(this.resource).subscribe(
            stResp => {
                this.update.emit();
            }
        );
    }

    //menu items authorization
    private isSetDeprecatedDisabled(): boolean {
        return (
            !this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) || 
            !AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.RESOURCES_SET_DEPRECATED, this.resource)
        );
    }
    private isAlignDisabled(): boolean {
        return (
            !this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) || 
		    !AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.ALIGNMENT_ADD_ALIGNMENT, this.resource)
        );
	}
	private isSpawnFromLabelDisabled(): boolean {
        return (
            !this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) || 
		    !AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.REFACTOR_SPAWN_NEW_CONCEPT_FROM_LABEL)
        );
	}

}