import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTResource } from '../models/ARTResources';
import { UIUtils } from "../utils/UIUtils";
import { ProjectContext } from "../utils/VBContext";

@Component({
    selector: "resource-view-modal",
    templateUrl: "./resourceViewModal.html",
})
export class ResourceViewModal {
    @Input() resource: ARTResource;
    @Input() readonly: boolean = true;
    @Input() projectCtx: ProjectContext;

    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    ok() {
        this.activeModal.close();
    }

}