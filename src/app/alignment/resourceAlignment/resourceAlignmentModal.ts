import { Component } from "@angular/core";
import { DialogRef, ModalComponent, OverlayConfig } from 'ngx-modialog';
import { BSModalContext, BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTResource, ARTURIResource } from "../../models/ARTResources";
import { BrowseExternalResourceModalReturnData } from "../../resourceView/resViewModals/browseExternalResourceModal";
import { ResViewModalServices } from "../../resourceView/resViewModals/resViewModalServices";
import { AlignmentServices } from "../../services/alignmentServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { AssistedSearchModal, AssistedSearchModalData } from "./assistedSearchModal";
import { MapleServices } from "../../services/mapleServices";
import { VBContext } from "../../utils/VBContext";

export class ResourceAlignmentModalData extends BSModalContext {
    /**
     * @param resource the resource to align
     */
    constructor(public resource: ARTURIResource) {
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
    
    constructor(public dialog: DialogRef<ResourceAlignmentModalData>, private alignService: AlignmentServices,
        private mapleService: MapleServices, private resViewModals: ResViewModalServices, private basicModals: BasicModalServices, 
        private modal: Modal) {
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
    
    private browseLocalProjects() {
        this.resViewModals.browseExternalResource("Select remote resource").then(
            (data: BrowseExternalResourceModalReturnData) => { 
                this.alignedObject = data.resource; 
            },
            () => { this.alignedObject = null; }
        );
    }

    private assistedSearch() {
        this.mapleService.checkProjectMetadataAvailability().subscribe(
            available => {
                if (available) {
                    this.openAssistedSearchModal();
                } else {
                    this.basicModals.confirm("Missing Project Metadata", "In order to exploit this feature, the system needs VoID/LIME metadata"
                        + " for the current project (" + VBContext.getWorkingProject().getName() + "). This metadata is currently not available."
                        + " Do you want to let the system proceed to the creation of them? If you refuse it will not be possible to use the "
                        + " assisted-search feature.").then(
                        confirm => {
                            this.mapleService.profileProject().subscribe(
                                resp => {
                                    this.openAssistedSearchModal();
                                }
                            );
                        },
                        () => {} //user didn't confirm, don't do nothing
                    );
                }
            }
        );
    }

    private openAssistedSearchModal() {
        var modalData = new AssistedSearchModalData(this.context.resource);
        const builder = new BSModalContextBuilder<AssistedSearchModalData>(
            modalData, undefined, AssistedSearchModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        this.modal.open(AssistedSearchModal, overlayConfig).result;
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