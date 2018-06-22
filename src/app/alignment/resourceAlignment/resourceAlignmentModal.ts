import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from 'ngx-modialog';
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTResource, ARTURIResource } from "../../models/ARTResources";
import { BrowseExternalResourceModalReturnData } from "../../resourceView/resViewModals/browseExternalResourceModal";
import { ResViewModalServices } from "../../resourceView/resViewModals/resViewModalServices";
import { AlignmentServices } from "../../services/alignmentServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

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
    
    constructor(public dialog: DialogRef<ResourceAlignmentModalData>, private alignService: AlignmentServices,
        private resViewModals: ResViewModalServices, private basicModals: BasicModalServices) {
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
        this.resViewModals.browseExternalResource("Select remote resource").then(
            (data: BrowseExternalResourceModalReturnData) => { 
                this.alignedObject = data.resource; 
            },
            () => { this.alignedObject = null; }
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