import { Component, ElementRef } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTResource } from '../models/ARTResources';
import { UIUtils } from "../utils/UIUtils";

export class ResourceViewModalData extends BSModalContext {
    constructor(public resource: ARTResource, public readonly: boolean = true) {
        super();
    }
}

@Component({
    selector: "resource-view-modal",
    templateUrl: "./resourceViewModal.html",
})
export class ResourceViewModal implements ModalComponent<ResourceViewModalData> {
    context: ResourceViewModalData;

    constructor(public dialog: DialogRef<ResourceViewModalData>, private elementRef: ElementRef) {
        this.context = dialog.context;
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}