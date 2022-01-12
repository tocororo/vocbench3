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
    @Input() resourceList: ARTNode[];
    @Input() multiselection: boolean = false; //tells if multiple selection is allowed
    @Input() selectedResources: ARTNode[]; //resources that will be selected once the dialog is initialized
    @Input() emptySelectionAllowed: boolean = false;
    @Input() rendering: boolean = true;
    
    private selection: ARTNode[];
    
    constructor(public activeModal: NgbActiveModal) {}

    isOkEnabled() {
        return this.emptySelectionAllowed || this.selection && this.selection.length > 0;
    }
    
    onResourceSelected(resources: ARTNode[]) {
        this.selection = resources;
    }

    onResDblClicked(resource: ARTNode) {
        if (!this.multiselection) {
            this.selection = [resource];
            this.ok();
        }
    }

    ok() {
        this.activeModal.close(this.selection);
    }

    cancel() {
        this.activeModal.dismiss();
    }
}