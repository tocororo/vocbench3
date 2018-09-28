import {Component} from "@angular/core";
import {BSModalContext} from 'ngx-modialog/plugins/bootstrap';
import {DialogRef, ModalComponent} from "ngx-modialog";
import {ARTNode} from "../../../../models/ARTResources";

export class ResourceSelectionModalData extends BSModalContext {
    /**
     * @param title modal title
     * @param message modal message, if null no the message is shwown the modal
     * @param resourceList resources available for the choise
     */
    constructor(
        public title: string = 'Modal Title',
        public message: string,
        public resourceList: Array<ARTNode>,
        public rendering: boolean = true
    ) {
        super();
    }
}

/**
 * Modal that allows to choose among a set of rdfResource
 */
@Component({
    selector: "resource-selection-modal",
    templateUrl: "./resourceSelectionModal.html",
})
export class ResourceSelectionModal implements ModalComponent<ResourceSelectionModalData> {
    context: ResourceSelectionModalData;
    
    private rendering: boolean;
    private resourceSelected: ARTNode;
    
    constructor(public dialog: DialogRef<ResourceSelectionModalData>) {
        this.context = dialog.context;
        this.rendering = this.context.rendering;
    }
    
    private isResourceSelected(resource: ARTNode) {
        return this.resourceSelected == resource;
    }
    
    private onResourceSelected(resource: ARTNode) {
        this.resourceSelected = resource;
    }

    ok(event: Event) {
        event.stopPropagation();
        this.dialog.close(this.resourceSelected);
    }

    cancel() {
        this.dialog.dismiss();
    }
}