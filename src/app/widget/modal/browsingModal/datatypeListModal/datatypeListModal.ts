import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';

export class DatatypeListModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title') {
        super();
    }
}

@Component({
    selector: "datatype-list-modal",
    templateUrl: "./datatypeListModal.html",
})
export class DatatypeListModal implements ModalComponent<DatatypeListModalData> {
    context: DatatypeListModalData;
    
    private selectedNode: ARTURIResource;
    
    constructor(public dialog: DialogRef<DatatypeListModalData>) {
        this.context = dialog.context;
    }

    private onNodeSelected(node: ARTURIResource) {
        this.selectedNode = node;
    }
    
    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedNode);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}