import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from "../../models/ARTResources";

@Component({
    selector: "assisted-search-result-modal",
    templateUrl: "./assistedSearchResultModal.html",
})
export class AssistedSearchResultModal {
    @Input() title: string;
    @Input() resourceList: Array<ARTURIResource>;

    resourceSelected: ARTURIResource;

    constructor(public activeModal: NgbActiveModal) {}

    ok() {
        this.activeModal.close(this.resourceSelected);
    }

    cancel() {
        this.activeModal.dismiss();
    }
}