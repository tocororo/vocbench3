import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { ARTURIResource } from "../../models/ARTResources";

export class AssistedSearchResultModalData extends BSModalContext {
    constructor(
        public title: string,
        public resourceList: Array<ARTURIResource>
    ) {
        super();
    }
}

@Component({
    selector: "assisted-search-result-modal",
    templateUrl: "./assistedSearchResultModal.html",
})
export class AssistedSearchResultModal implements ModalComponent<AssistedSearchResultModalData> {
    context: AssistedSearchResultModalData;

    private resourceSelected: ARTURIResource;

    constructor(public dialog: DialogRef<AssistedSearchResultModalData>) {
        this.context = dialog.context;
    }

    ok(event: Event) {
        event.stopPropagation();
        this.dialog.close(this.resourceSelected);
    }

    cancel() {
        this.dialog.dismiss();
    }
}