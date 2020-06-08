import { Injectable } from '@angular/core';
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { Reference } from '../../../models/Configuration';
import { Report, ServiceInvocationDefinition } from '../../../models/InvokableReporter';
import { InvokableReporterEditorModal, InvokableReporterEditorModalData } from './invokableReporterEditorModal';
import { ReportResultModal, ReportResultModalData } from './reportResultModal';
import { ServiceInvocationEditorModal, ServiceInvocationEditorModalData } from './serviceInvocationEditorModal';


@Injectable()
export class InvokableReporterModalServices {

    constructor(private modal: Modal) { }

    public openInvokableReporterEditor(title: string, reporterRef?: Reference): Promise<void> {
        let modalData = new InvokableReporterEditorModalData(title, reporterRef);
        const builder = new BSModalContextBuilder<InvokableReporterEditorModalData>(
            modalData, undefined, InvokableReporterEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(InvokableReporterEditorModal, overlayConfig).result;
    }

    public openServiceInvocationEditor(title: string, invokableReporterRef: Reference, serviceInvocation?: { def: ServiceInvocationDefinition, idx: number }): Promise<void> {
        let modalData = new ServiceInvocationEditorModalData(title, invokableReporterRef, serviceInvocation);
        const builder = new BSModalContextBuilder<ServiceInvocationEditorModalData>(
            modalData, undefined, ServiceInvocationEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        return this.modal.open(ServiceInvocationEditorModal, overlayConfig).result;
    }

    public showReport(report: Report): Promise<void> {
        let modalData = new ReportResultModalData(report);
        const builder = new BSModalContextBuilder<ReportResultModalData>(
            modalData, undefined, ReportResultModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(ReportResultModal, overlayConfig).result;
    }

}