import { Component, ElementRef } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTResource } from "../../models/ARTResources";
import { ResourcesServices } from "../../services/resourcesServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";

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

    private editAuthorized: boolean;
    private pristineDescription: string;
    private description: string;


    constructor(public dialog: DialogRef<ResourceTripleEditorModalData>, private elementRef: ElementRef,
        private resourcesService: ResourcesServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        //editor disabled if user has no permission to edit
        this.editAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateResourceTriplesDescription, this.context.resource);

        this.resourcesService.getOutgoingTriples(this.context.resource, "N-Triples").subscribe(
            triples => {
                this.description = triples;
            }
        );
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    private isOkEnabled(): boolean {
        return this.description != null && this.description.trim() != "";
    }

    ok() {
        if (this.description == this.pristineDescription) { //nothing changed
            this.cancel();
        } else {
            this.resourcesService.updateResourceTriplesDescription(this.context.resource, this.description, "N-Triples").subscribe(
                () => {
                    this.dialog.close();
                }
            );
        }
    }

    cancel() {
        this.dialog.dismiss();
    }

}