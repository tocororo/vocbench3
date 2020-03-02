import { Component, ElementRef } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTResource } from "../../models/ARTResources";
import { UIUtils } from "../../utils/UIUtils";

export class ResourceTripleEditorModalData extends BSModalContext {
    constructor(public resource: ARTResource, public readonly: boolean) {
        super();
    }
}

@Component({
    selector: "resource-triple-editor-modal",
    templateUrl: "./resourceTripleEditorModal.html",
})
export class ResourceTripleEditorModal implements ModalComponent<ResourceTripleEditorModalData> {
    context: ResourceTripleEditorModalData;


    constructor(public dialog: DialogRef<ResourceTripleEditorModalData>, private elementRef: ElementRef) {
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

    cancel() {
        this.dialog.dismiss();
    }

}