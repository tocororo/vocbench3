import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";
import { ProjectContext } from "../../../../utils/VBContext";

@Component({
    selector: "scheme-list-modal",
    templateUrl: "./schemeListModal.html",
})
export class SchemeListModal {
    @Input() title: string;
    @Input() projectCtx?: ProjectContext;
    
    selectedScheme: ARTURIResource;
    
    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {}

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }
    
    ok() {
        this.activeModal.close(this.selectedScheme);
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
    onSchemeSelected(scheme: ARTURIResource) {
        this.selectedScheme = scheme;
    }

}