import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { ARTResource } from "../models/ARTResources";
import { SKOS } from "../models/Vocabulary";
import { AlignmentServices } from "../services/alignmentServices";
import { ResourceAlignmentModal, ResourceAlignmentModalData } from "../alignment/resourceAlignment/resourceAlignmentModal"
import { CreationModalServices } from "../widget/modal/creationModal/creationModalServices";

@Component({
    selector: "res-view-menu",
    templateUrl: "./resourceViewCtxMenu.html",
})
export class ResourceViewContextMenu {

    @Input() resource: ARTResource;
    @Output() update = new EventEmitter();

    constructor(private alignServices: AlignmentServices, private creationModals: CreationModalServices, private modal: Modal) { }

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
                console.log(data);
            },
            () => {}
        );
    }

}