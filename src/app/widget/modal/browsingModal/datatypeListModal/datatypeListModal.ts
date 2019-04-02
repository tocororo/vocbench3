import { Component, ElementRef } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from '../../../../models/ARTResources';
import { UIUtils } from "../../../../utils/UIUtils";

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
    
    constructor(public dialog: DialogRef<DatatypeListModalData>, private elementRef: ElementRef) {
        this.context = dialog.context;
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
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