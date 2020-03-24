import { Component, ElementRef } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from "../../models/ARTResources";
import { ResourcesServices } from "../../services/resourcesServices";
import { UIUtils } from "../../utils/UIUtils";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../../utils/VBActions";

export class ResourceTripleEditorModalData extends BSModalContext {
    constructor(public resource: ARTURIResource, public readonly: boolean) {
        super();
    }
}

@Component({
    selector: "resource-triple-editor-modal",
    templateUrl: "./resourceTripleEditorModal.html",
})
export class ResourceTripleEditorModal implements ModalComponent<ResourceTripleEditorModalData> {
    context: ResourceTripleEditorModalData;

    private editAuthorized: boolean;
    private description: string;


    constructor(public dialog: DialogRef<ResourceTripleEditorModalData>, private elementRef: ElementRef,
        private resourcesService: ResourcesServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        //editor disabled if user has no permission to edit
        this.editAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateResourceTriplesDescription, this.context.resource);

        this.resourcesService.getResourceTriplesDescription(this.context.resource, "N-Triples").subscribe(
            triples => {
                this.description = triples;
            }
        );
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    ok() {
        this.resourcesService.updateResourceTriplesDescription(this.context.resource, this.description, "N-Triples").subscribe(
            () => {
                this.dialog.close();
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}