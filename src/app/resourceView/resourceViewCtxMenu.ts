import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { AlignmentServices } from "../services/alignmentServices";
import { RefactorServices } from "../services/refactorServices";
import { ResourceAlignmentModal, ResourceAlignmentModalData } from "../alignment/resourceAlignment/resourceAlignmentModal"
import { CreationModalServices } from "../widget/modal/creationModal/creationModalServices";
import { ARTResource, ARTURIResource } from "../models/ARTResources";
import { SKOS } from "../models/Vocabulary";
import { VBPreferences } from "../utils/VBPreferences";

@Component({
    selector: "res-view-menu",
    templateUrl: "./resourceViewCtxMenu.html",
})
export class ResourceViewContextMenu {

    @Input() resource: ARTResource;
    @Output() update = new EventEmitter();

    constructor(private alignServices: AlignmentServices, private refactorService: RefactorServices,
        private preferences: VBPreferences, private creationModals: CreationModalServices, private modal: Modal) { }

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

    private setAsDeprecated() {
        alert("Not yet available");
    }

    private spawnNewConceptWithLabel() {
        this.creationModals.newConceptFromLabel("Spawn new concept", this.resource, SKOS.concept).then(
            data => {
                let schemes: ARTURIResource[] = this.preferences.getActiveSchemes();
                //from the resView of the xLabel I don't know the concept to which it belongs, 
                //so oldConcept in spawnNewConceptFromLabel request is null and lets the server find the oldConcept
                this.refactorService.spawnNewConceptFromLabel(this.resource, schemes, null,
                    data.uriResource, data.broader, data.cfId, data.cfValueMap).subscribe(
                    stResp => {
                        this.update.emit();
                    }
                );
            },
            () => { }
        );
    }

}