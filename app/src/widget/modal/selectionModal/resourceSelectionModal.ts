import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';
import {RdfResourceComponent} from "../../../widget/rdfResource/rdfResourceComponent";
import {ARTURIResource} from "../../../utils/ARTResources";

export class ResourceSelectionModalContent {
    public title: string = 'Modal Title';
    public message: string;
    public resourceList: Array<ARTURIResource>;
    /**
     * @param title modal title
     * @param message modal message, if null no the message is shwown the modal
     * @param resourceList resources available for the choise
     */
    constructor(title: string,  message: string, resourceList: Array<ARTURIResource>) {
        this.title = title;
        this.message = message;
        this.resourceList = resourceList;
    }
}

/**
 * Modal that allows to choose among a set of rdfResource
 */
@Component({
    selector: "resource-selection-modal",
    templateUrl: "app/src/widget/modal/selectionModal/resourceSelectionModal.html",
    directives: [RdfResourceComponent]
})
export class ResourceSelectionModal implements ICustomModalComponent {
    
    private resourceSelected;
    
    dialog: ModalDialogInstance;
    context: ResourceSelectionModalContent;
    
    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <ResourceSelectionModalContent>modelContentData;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
    }
    
    private isResourceSelected(resource: ARTURIResource) {
        return this.resourceSelected == resource;
    }
    
    private onResourceSelected(resource: ARTURIResource) {
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