import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";

@Component({
    selector: "datatype-list-modal",
    templateUrl: "./datatypeListModal.html",
})
export class DatatypeListModal {
    @Input() title: string;
    
    selectedNode: ARTURIResource;
    
    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {}

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    onNodeSelected(node: ARTURIResource) {
        this.selectedNode = node;
    }
    
    ok() {
        this.activeModal.close(this.selectedNode);
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
}