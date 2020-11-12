import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTNode } from "../../../../models/ARTResources";

/**
 * Modal that allows to choose among a set of rdfResource
 */
@Component({
    selector: "resource-selection-modal",
    templateUrl: "./resourceSelectionModal.html",
})
export class ResourceSelectionModal {
    @Input() title: string;
    @Input() message: string;
    @Input() resourceList: Array<ARTNode>;
    @Input() rendering: boolean = true;
    
    resourceSelected: ARTNode;
    
    constructor(public activeModal: NgbActiveModal) {}
    
    isResourceSelected(resource: ARTNode) {
        return this.resourceSelected == resource;
    }
    
    onResourceSelected(resource: ARTNode) {
        this.resourceSelected = resource;
    }

    ok() {
        this.activeModal.close(this.resourceSelected);
    }

    cancel() {
        this.activeModal.dismiss();
    }
}