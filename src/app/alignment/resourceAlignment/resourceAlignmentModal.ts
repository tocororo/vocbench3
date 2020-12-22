import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../models/ARTResources";
import { BrowseExternalResourceModalReturnData } from "../../resourceView/resourceViewEditor/resViewModals/browseExternalResourceModal";
import { ResViewModalServices } from "../../resourceView/resourceViewEditor/resViewModals/resViewModalServices";
import { AlignmentServices } from "../../services/alignmentServices";
import { MapleServices } from "../../services/mapleServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { AssistedSearchModal } from "./assistedSearchModal";

@Component({
    selector: "align-modal",
    templateUrl: "./resourceAlignmentModal.html",
})
export class ResourceAlignmentModal {
    @Input() resource: ARTURIResource; //the resource to align

    @ViewChild('blockingDiv', { static: true }) public blockingDivElement: ElementRef;
    
    mappingPropList: Array<ARTURIResource>;
    mappingProperty: ARTURIResource;
    allPropCheck: boolean = false;
    alignedObject: ARTURIResource;
    
    constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, private alignService: AlignmentServices,
        private mapleService: MapleServices, private resViewModals: ResViewModalServices, private basicModals: BasicModalServices) {
    }
    
    ngOnInit() {
        this.initPropList();
    }
    
    initPropList() {
        this.alignService.getMappingProperties(this.resource.getRole(), this.allPropCheck).subscribe(
            props => {
                this.mappingPropList = props;
                this.mappingProperty = null;
            }
        )
    }
    
    onAllPropCheckChange(checked: boolean) {
        this.allPropCheck = checked;
        this.initPropList();
    }
    
    browseLocalProjects() {
        this.resViewModals.browseExternalResource({key:"ACTIONS.SELECT_EXTERNAL_RESOURCE"}).then(
            (data: BrowseExternalResourceModalReturnData) => { 
                this.alignedObject = data.resource; 
            },
            () => { this.alignedObject = null; }
        );
    }

    assistedSearch() {
        const modalRef: NgbModalRef = this.modalService.open(AssistedSearchModal, new ModalOptions());
        modalRef.componentInstance.resource = this.resource;
        modalRef.result.then(
            resource => {
                this.alignedObject = resource;
            },
            () => {}
        );
    }

    enterManually() {
        this.basicModals.prompt({key:"ACTIONS.INSERT_VALUE_MANUALLY"}, { value: "IRI" }).then(
            valueIRI => {
                if (ResourceUtils.testIRI(valueIRI)) {
                    this.alignedObject = new ARTURIResource(valueIRI);
                } else {
                    this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, {key:"MESSAGES.INVALID_IRI", params:{iri: valueIRI}}, ModalType.warning);
                }
            }
        );
    }
    
    isOkClickable(): boolean {
        return (this.alignedObject != undefined && this.mappingProperty != undefined);
    }

    ok() {
        this.activeModal.close({property: this.mappingProperty, object: this.alignedObject});
    }
    
    cancel() {
        this.activeModal.dismiss();
    }

}