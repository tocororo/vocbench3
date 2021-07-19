import { Injectable } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { CommitInfo } from "../../models/History";
import { CommitDeltaModal } from "./commitDeltaModal";
import { OperationParamsModal } from "./operationParamsModal";

@Injectable()
export class HistoryValidationModalServices {

    constructor(private modalService: NgbModal) { }

    inspectParams(item: CommitInfo) {
        const modalRef: NgbModalRef = this.modalService.open(OperationParamsModal, new ModalOptions());
        modalRef.componentInstance.commit = item;
        return modalRef;
    }

    getCommitDelta(item: CommitInfo) {
        const modalRef: NgbModalRef = this.modalService.open(CommitDeltaModal, new ModalOptions('lg'));
        modalRef.componentInstance.commit = item;
        return modalRef;
    }

}