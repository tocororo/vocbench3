import { Component, EventEmitter, Input, Output } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ResourceAlignmentModal, ResourceAlignmentModalData } from "../alignment/resourceAlignment/resourceAlignmentModal";
import { GraphModalServices } from "../graph/modal/graphModalServices";
import { ARTResource, ARTURIResource, ResAttribute } from "../models/ARTResources";
import { SKOS } from "../models/Vocabulary";
import { AlignmentServices } from "../services/alignmentServices";
import { RefactorServices } from "../services/refactorServices";
import { ResourcesServices } from "../services/resourcesServices";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { ResourceUtils } from "../utils/ResourceUtils";
import { VBActionsEnum } from "../utils/VBActions";
import { VBProperties } from "../utils/VBProperties";
import { CreationModalServices } from "../widget/modal/creationModal/creationModalServices";

@Component({
    selector: "res-view-menu",
    templateUrl: "./resourceViewCtxMenu.html",
})
export class ResourceViewContextMenu {

    @Input() resource: ARTResource;
    @Input() readonly: boolean;
    @Input() rendering: boolean;
    @Output() update = new EventEmitter();

    constructor(private alignServices: AlignmentServices, private refactorService: RefactorServices, private resourcesService: ResourcesServices,
        private creationModals: CreationModalServices, private graphModals: GraphModalServices, private modal: Modal,
        private vbProp: VBProperties) { }

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
        var modalData = new ResourceAlignmentModalData(<ARTURIResource>this.resource); //cast since alignment is available only for URI
        const builder = new BSModalContextBuilder<ResourceAlignmentModalData>(
            modalData, undefined, ResourceAlignmentModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(ResourceAlignmentModal, overlayConfig).result;
    }

    private spawnNewConceptWithLabel() {
        this.creationModals.newConceptFromLabel("Spawn new concept", this.resource, SKOS.concept).then(
            data => {
                //from the resView of the xLabel I don't know the concept to which it belongs, 
                //so oldConcept in spawnNewConceptFromLabel request is null and lets the server find the oldConcept
                this.refactorService.spawnNewConceptFromLabel(this.resource, data.schemes, null,
                    data.uriResource, data.broader, data.cfValue).subscribe(
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
                //do not emit update event. The resource view is updated after "resourceDeprecatedEvent" thrown by the setDeprecated service
                // this.update.emit();
            }
        );
    }


    private isOpenDataGraphEnabled(): boolean {
        return this.vbProp.getExperimentalFeaturesEnabled();
    }

    private openDataGraph() {
        this.graphModals.openDataGraph(this.resource, this.rendering);
    }

    //menu items authorization
    private isSetDeprecatedDisabled(): boolean {
        return (
            (!this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) && !ResourceUtils.isResourceInStagingAdd(this.resource)) || 
            !AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesSetDeprecated, this.resource)
        );
    }
    private isAlignDisabled(): boolean {
        return (
            (!this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) && !ResourceUtils.isResourceInStagingAdd(this.resource)) || 
		    !AuthorizationEvaluator.isAuthorized(VBActionsEnum.alignmentAddAlignment, this.resource)
        );
	}
	private isSpawnFromLabelDisabled(): boolean {
        return (
            !this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) || 
		    !AuthorizationEvaluator.isAuthorized(VBActionsEnum.refactorSpawnNewConceptFromLabel)
        );
	}

}