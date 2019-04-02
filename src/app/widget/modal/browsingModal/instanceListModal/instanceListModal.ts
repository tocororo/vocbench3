import { Component, ElementRef } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";

export class InstanceListModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title', public cls: ARTURIResource) {
        super();
    }
}

@Component({
    selector: "instance-list-modal",
    templateUrl: "./instanceListModal.html",
})
export class InstanceListModal implements ModalComponent<InstanceListModalData> {
    context: InstanceListModalData;
    
    private selectedInstance: ARTURIResource;
    
    constructor(public dialog: DialogRef<InstanceListModalData>, private elementRef: ElementRef) {
        this.context = dialog.context;
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedInstance);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
    private onInstanceSelected(instance: ARTURIResource) {
        this.selectedInstance = instance;
    }

}