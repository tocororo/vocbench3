import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";
import { ProjectContext } from "../../../../utils/VBContext";

@Component({
    selector: "class-tree-modal",
    templateUrl: "./classTreeModal.html",
})
export class ClassTreeModal {
    @Input() title: string;
    @Input() roots?: ARTURIResource[];
    @Input() projectCtx?: ProjectContext;
    
    selectedClass: ARTURIResource;

    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {}

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    ok() {
        this.activeModal.close(this.selectedClass);
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
    onClassSelected(cls: ARTURIResource) {
        this.selectedClass = cls;
    }

}