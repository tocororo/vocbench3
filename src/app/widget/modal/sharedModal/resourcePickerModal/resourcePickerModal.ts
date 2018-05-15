import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTResource, RDFResourceRolesEnum, ARTURIResource } from "../../../../models/ARTResources";

export class ResourcePickerModalData extends BSModalContext {
    constructor(public title: string, public roles: RDFResourceRolesEnum[], public editable: boolean) {
        super();
    }
}

@Component({
    selector: "resource-picker-modal",
    templateUrl: "./resourcePickerModal.html",
})
export class ResourcePickerModal implements ModalComponent<ResourcePickerModalData> {
    context: ResourcePickerModalData;

    private resource: ARTResource;

    constructor(public dialog: DialogRef<ResourcePickerModalData>) {
        this.context = dialog.context;
    }

    private updateResource(res: ARTURIResource) {
        this.resource = res;
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.resource);
    }

    cancel() {
        this.dialog.dismiss();
    }

}