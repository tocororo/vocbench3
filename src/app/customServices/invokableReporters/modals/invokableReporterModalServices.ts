import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ModalOptions, TextOrTranslation } from 'src/app/widget/modal/Modals';
import { Reference } from '../../../models/Configuration';
import { Report, ServiceInvocationDefinition } from '../../../models/InvokableReporter';
import { InvokableReporterEditorModal } from './invokableReporterEditorModal';
import { ReportResultModal } from './reportResultModal';
import { ServiceInvocationEditorModal } from './serviceInvocationEditorModal';


@Injectable()
export class InvokableReporterModalServices {

    constructor(private modalService: NgbModal, private translateService: TranslateService) { }

    public openInvokableReporterEditor(title: TextOrTranslation, existingReporters: Reference[], reporterRef?: Reference): Promise<void> {
        const modalRef: NgbModalRef = this.modalService.open(InvokableReporterEditorModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
		modalRef.componentInstance.existingReporters = existingReporters;
		if (reporterRef != null) modalRef.componentInstance.reporterRef = reporterRef;
        return modalRef.result;
    }

    public openServiceInvocationEditor(title: TextOrTranslation, invokableReporterRef: Reference, serviceInvocation?: { def: ServiceInvocationDefinition, idx: number }): Promise<void> {
        const modalRef: NgbModalRef = this.modalService.open(ServiceInvocationEditorModal, new ModalOptions('lg'));
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
		modalRef.componentInstance.invokableReporterRef = invokableReporterRef;
		if (serviceInvocation != null) modalRef.componentInstance.serviceInvocation = serviceInvocation;
        return modalRef.result;
    }

    public showReport(report: Report): Promise<void> {
        const modalRef: NgbModalRef = this.modalService.open(ReportResultModal, new ModalOptions('lg'));
        modalRef.componentInstance.report = report;
        return modalRef.result;
    }

}