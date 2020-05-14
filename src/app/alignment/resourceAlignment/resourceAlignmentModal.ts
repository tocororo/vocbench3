import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogRef, ModalComponent, OverlayConfig } from 'ngx-modialog';
import { BSModalContext, BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from "../../models/ARTResources";
import { BrowseExternalResourceModalReturnData } from "../../resourceView/resourceViewEditor/resViewModals/browseExternalResourceModal";
import { ResViewModalServices } from "../../resourceView/resourceViewEditor/resViewModals/resViewModalServices";
import { AlignmentServices } from "../../services/alignmentServices";
import { MapleServices } from "../../services/mapleServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { AssistedSearchModal, AssistedSearchModalData } from "./assistedSearchModal";

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

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;
    
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
        var modalData = new AssistedSearchModalData(this.context.resource);
        const builder = new BSModalContextBuilder<AssistedSearchModalData>(
            modalData, undefined, AssistedSearchModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(AssistedSearchModal, overlayConfig).result.then(
            resource => {
                this.alignedObject = resource;
            },
            () => {}
        );
    }

    private enterManually() {
        this.basicModals.prompt("Insert value manually", { value: "IRI" }).then(
            valueIRI => {
                if (ResourceUtils.testIRI(valueIRI)) {
                    this.alignedObject = new ARTURIResource(valueIRI);
                } else {
                    this.basicModals.alert("Invalid IRI", valueIRI + " is not a valid IRI", "warning");
                }
            }
        );
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