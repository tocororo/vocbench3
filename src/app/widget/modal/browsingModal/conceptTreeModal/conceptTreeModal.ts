import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";
import { ProjectContext } from "../../../../utils/VBContext";

@Component({
    selector: "concept-tree-modal",
    templateUrl: "./conceptTreeModal.html",
})
export class ConceptTreeModal {
    @Input() title: string;
    @Input() schemes: ARTURIResource[];
    @Input() schemeChangeable: boolean = false;
    @Input() projectCtx?: ProjectContext;
    
    selectedConcept: ARTURIResource;
    
    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {}

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    ok() {
        this.activeModal.close(this.selectedConcept);
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
    onConceptSelected(concept: ARTURIResource) {
        this.selectedConcept = concept;
    }

}