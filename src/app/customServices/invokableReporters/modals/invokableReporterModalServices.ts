import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { Reference } from '../../../models/Configuration';
import { Report, ServiceInvocationDefinition } from '../../../models/InvokableReporter';
import { InvokableReporterEditorModal } from './invokableReporterEditorModal';
import { ReportResultModal } from './reportResultModal';
import { ServiceInvocationEditorModal } from './serviceInvocationEditorModal';


@Injectable()
export class InvokableReporterModalServices {

    constructor(private modalService: NgbModal) { }

    public openInvokableReporterEditor(title: string, existingReporters: Reference[], reporterRef?: Reference): Promise<void> {
        const modalRef: NgbModalRef = this.modalService.open(InvokableReporterEditorModal, new ModalOptions());
        modalRef.componentInstance.title = title;
		modalRef.componentInstance.existingReporters = existingReporters;
		modalRef.componentInstance.reporterRef = reporterRef;
        return modalRef.result;
    }

    public openServiceInvocationEditor(title: string, invokableReporterRef: Reference, serviceInvocation?: { def: ServiceInvocationDefinition, idx: number }): Promise<void> {
        const modalRef: NgbModalRef = this.modalService.open(ServiceInvocationEditorModal, new ModalOptions('lg'));
        modalRef.componentInstance.title = title;
		modalRef.componentInstance.invokableReporterRef = invokableReporterRef;
		modalRef.componentInstance.serviceInvocation = serviceInvocation;
        return modalRef.result;
    }

    public showReport(report: Report): Promise<void> {
        const modalRef: NgbModalRef = this.modalService.open(ReportResultModal, new ModalOptions('lg'));
        modalRef.componentInstance.report = report;
        return modalRef.result;
    }

}