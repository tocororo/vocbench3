import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";
import { ProjectContext } from "../../../../utils/VBContext";

@Component({
    selector: "class-individual-tree-modal",
    templateUrl: "./classIndividualTreeModal.html",
})
export class ClassIndividualTreeModal {
    @Input() title: string;
    @Input() classes: ARTURIResource[];
    @Input() projectCtx: ProjectContext;
    
    selectedInstance: ARTURIResource;
    
    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {}

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }
    
    ok() {
        this.activeModal.close(this.selectedInstance);
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
    onInstanceSelected(instance: ARTURIResource) {
        this.selectedInstance = instance;
    }

}