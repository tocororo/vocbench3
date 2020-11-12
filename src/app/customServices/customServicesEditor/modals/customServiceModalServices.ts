import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { CustomOperationDefinition, CustomService } from '../../../models/CustomService';
import { CustomOperationEditorModal } from './customOperationEditorModal';
import { CustomOperationModal } from './customOperationModal';
import { CustomServiceEditorModal } from './customServiceEditorModal';


@Injectable()
export class CustomServiceModalServices {

    constructor(private modalService: NgbModal) { }

    public openCustomServiceEditor(title: string, serviceConf?: CustomService): Promise<void> {
        const modalRef: NgbModalRef = this.modalService.open(CustomServiceEditorModal, new ModalOptions());
        modalRef.componentInstance.title = title;
		modalRef.componentInstance.service = serviceConf;
        return modalRef.result;
    }
    
    public openCustomOperationEditor(title: string, customServiceId: string, operation?: CustomOperationDefinition): Promise<void> {
        const modalRef: NgbModalRef = this.modalService.open(CustomOperationEditorModal, new ModalOptions('lg'));
        modalRef.componentInstance.title = title;
		modalRef.componentInstance.customServiceId = customServiceId;
		modalRef.componentInstance.operation = operation;
        return modalRef.result;
    }

    public openCustomOperationView(operation: CustomOperationDefinition): Promise<void> {
        const modalRef: NgbModalRef = this.modalService.open(CustomOperationModal, new ModalOptions('lg'));
        modalRef.componentInstance.operation = operation;
        return modalRef.result;
    }

}