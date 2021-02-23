import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";
import { ProjectContext } from "../../../../utils/VBContext";

@Component({
    selector: "translationset-list-modal",
    templateUrl: "./translationSetModal.html",
})
export class TranslationSetModal {
    @Input() title: string;
    @Input() editable: boolean = false;
    @Input() deletable: boolean = false;
    @Input() allowMultiselection: boolean = false;
    @Input() projectCtx: ProjectContext;
    
    selectedResource: ARTURIResource;
    
    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {}

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }
    
    ok() {
        this.activeModal.close(this.selectedResource);
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
    onResourceSelected(scheme: ARTURIResource) {
        this.selectedResource = scheme;
    }

}