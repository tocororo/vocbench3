import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ResourcePickerConfig } from "src/app/widget/pickers/valuePicker/resourcePickerComponent";
import { ARTResource, ARTURIResource } from "../../../../models/ARTResources";

@Component({
    selector: "resource-picker-modal",
    templateUrl: "./resourcePickerModal.html",
})
export class ResourcePickerModal {
    @Input() title: string;
    @Input() config: ResourcePickerConfig;
    @Input() editable: boolean;

    resource: ARTResource;

    constructor(public activeModal: NgbActiveModal) {}

    updateResource(res: ARTURIResource) {
        this.resource = res;
    }

    ok() {
        this.activeModal.close(this.resource);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}