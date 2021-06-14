import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTResource } from "src/app/models/ARTResources";
import { Triple } from "src/app/models/Shared";
import { SharedModalServices } from "src/app/widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "inference-explanation-modal",
    templateUrl: "./inferenceExplanationModal.html",
})
export class InferenceExplanationModal {
    @Input() triple: Triple;
    @Input() rendering: boolean;

    constructor(public activeModal: NgbActiveModal, private sharedModals: SharedModalServices) {}

    onResourceClick(resource: ARTResource) {
        this.sharedModals.openResourceView(resource, true);
    }

    ok() {
        this.activeModal.close();
    }

}