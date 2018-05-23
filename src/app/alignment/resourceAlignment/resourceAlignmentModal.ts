import { Component } from "@angular/core";
import { DialogRef, ModalComponent, OverlayConfig } from 'ngx-modialog';
import { BSModalContext, BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { AlignmentServices } from "../../services/alignmentServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowseExternalResourceModal } from "./browseExternalResourceModal";

export class ResourceAlignmentModalData extends BSModalContext {
    /**
     * @param resource the resource to align
     */
    constructor(public resource: ARTResource) {
        super();
    }
}

@Component({
    selector: "align-modal",
    templateUrl: "./resourceAlignmentModal.html",
})
export class ResourceAlignmentModal implements ModalComponent<ResourceAlignmentModalData> {
    context: ResourceAlignmentModalData;
    
    private mappingPropList: Array<ARTURIResource>;
    private mappingProperty: ARTURIResource;
    private allPropCheck: boolean = false;
    private alignedObject: ARTURIResource;
    
    constructor(public dialog: DialogRef<ResourceAlignmentModalData>, public modal: Modal,
        public alignService: AlignmentServices, public basicModals: BasicModalServices) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        this.initPropList();
    }
    
    private initPropList() {
        this.alignService.getMappingProperties(this.context.resource, this.allPropCheck).subscribe(
            props => {
                this.mappingPropList = props;
                this.mappingProperty = null;
            }
        )
    }
    
    private onAllPropCheckChange(checked: boolean) {
        this.allPropCheck = checked;
        this.initPropList();
    }
    
    private browse() {
        if (this.context.resource.getRole() == RDFResourceRolesEnum.concept) {
            this.openBrowseExternalResModal("Select concept", RDFResourceRolesEnum.concept).then(
                (res: any) => { this.alignedObject = res; },
                () => { this.alignedObject = null; }
            );
        } else if (this.context.resource.getRole() == RDFResourceRolesEnum.cls) {
            this.openBrowseExternalResModal("Select class", RDFResourceRolesEnum.cls).then(
                (res: any) => { this.alignedObject = res; },
                () => { this.alignedObject = null; }
            );
        } else if (this.context.resource.getRole().toLowerCase().indexOf(RDFResourceRolesEnum.property) != -1) {
            this.openBrowseExternalResModal("Select property", RDFResourceRolesEnum.property).then(
                (res: any) => { this.alignedObject = res; },
                () => { this.alignedObject = null; }
            );
        } else if (this.context.resource.getRole() == RDFResourceRolesEnum.individual) {
            this.openBrowseExternalResModal("Select instance", RDFResourceRolesEnum.individual).then(
                (res: any) => { this.alignedObject = res; },
                () => { this.alignedObject = null; }
            );
        } else if (this.context.resource.getRole() == RDFResourceRolesEnum.conceptScheme) {
            this.openBrowseExternalResModal("Select concept scheme", RDFResourceRolesEnum.conceptScheme).then(
                (res: any) => { this.alignedObject = res; },
                () => { this.alignedObject = null; }
            );
        } else {
            this.basicModals.alert("Error", "Impossible to align this resource. Cannot determine the resource role", "error").then(
                result => { this.cancel(); }
            );
        }
    }
    
    /**
     * Opens a modal that allows to browse external project and select resource to align
     * @param title title of the modal
     * @param resRole role of the resource to explore.
     */
    private openBrowseExternalResModal(title: string, resRole: RDFResourceRolesEnum) {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(BrowseExternalResourceModal, overlayConfig).result;
    }
    
    private isOkClickable(): boolean {
        return (this.alignedObject != undefined && this.mappingProperty != undefined);
    }

    ok(event: Event) {
        event.stopPropagation();
        this.dialog.close({property: this.mappingProperty, object: this.alignedObject});
    }
    
    cancel() {
        this.dialog.dismiss();
    }

}