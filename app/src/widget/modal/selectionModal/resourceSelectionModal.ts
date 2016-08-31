import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {ARTNode} from "../../../utils/ARTResources";

export class ResourceSelectionModalData extends BSModalContext {
    /**
     * @param title modal title
     * @param message modal message, if null no the message is shwown the modal
     * @param resourceList resources available for the choise
     */
    constructor(
        public title: string = 'Modal Title',
        public message: string,
        public resourceList: Array<ARTNode>
    ) {
        super();
    }
}

/**
 * Modal that allows to choose among a set of rdfResource
 */
@Component({
    selector: "resource-selection-modal",
    templateUrl: "app/src/widget/modal/selectionModal/resourceSelectionModal.html",
})
export class ResourceSelectionModal implements ModalComponent<ResourceSelectionModalData> {
    context: ResourceSelectionModalData;
    
    private resourceSelected;
    
    constructor(public dialog: DialogRef<ResourceSelectionModalData>) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }
    
    private isResourceSelected(resource: ARTNode) {
        return this.resourceSelected == resource;
    }
    
    private onResourceSelected(resource: ARTNode) {
        this.resourceSelected = resource;
    }

    ok(event) {
        event.stopPropagation();
        this.dialog.close(this.resourceSelected);
    }

    cancel() {
        this.dialog.dismiss();
    }
}