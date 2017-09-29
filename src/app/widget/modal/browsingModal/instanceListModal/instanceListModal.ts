import {Component} from "@angular/core";
import {BSModalContext} from 'ngx-modialog/plugins/bootstrap';
import {DialogRef, ModalComponent} from "ngx-modialog";
import {ARTURIResource} from '../../../../models/ARTResources';

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
    
    constructor(public dialog: DialogRef<InstanceListModalData>) {
        this.context = dialog.context;
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