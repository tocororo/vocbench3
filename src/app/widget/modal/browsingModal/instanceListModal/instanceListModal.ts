import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";

@Component({
    selector: "instance-list-modal",
    templateUrl: "./instanceListModal.html",
})
export class InstanceListModal {
    @Input() title: string;
    @Input() cls: ARTURIResource;
    
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