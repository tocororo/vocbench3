import { Directive, EventEmitter, Output } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { ResourceViewServices } from "../../services/resourceViewServices";
import { ResViewSettingsModal } from "../resViewSettingsModal";

@Directive()
export abstract class AbstractResourceView {

    @Output() pendingValidation: EventEmitter<boolean> = new EventEmitter();

    protected resViewService: ResourceViewServices;
    protected modalService: NgbModal;
    constructor(resViewService: ResourceViewServices, modalService: NgbModal) {
        this.resViewService = resViewService;
        this.modalService = modalService;
    }

    /**
     * Opens a modal that allows to edit the resource view settings
     */
    openSettings() {
        const modalRef: NgbModalRef = this.modalService.open(ResViewSettingsModal, new ModalOptions('lg'));
        return modalRef.result;
    }
}