import { Injectable } from '@angular/core';
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { InvokableReporter, ServiceInvocationDefinition } from '../../../models/InvokableReporter';
import { InvokableReporterEditorModal, InvokableReporterEditorModalData } from './invokableReporterEditorModal';
import { ServiceInvocationEditorModalData, ServiceInvocationEditorModal } from './serviceInvocationEditorModal';


@Injectable()
export class InvokableReporterModalServices {

    constructor(private modal: Modal) { }

    public openInvokableReporterEditor(title: string, reporterConf?: InvokableReporter): Promise<void> {
        let modalData = new InvokableReporterEditorModalData(title, reporterConf);
        const builder = new BSModalContextBuilder<InvokableReporterEditorModalData>(
            modalData, undefined, InvokableReporterEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(InvokableReporterEditorModal, overlayConfig).result;
    }

    public openServiceInvocationEditor(title: string, invokableReporterId: string, invocation?: ServiceInvocationDefinition): Promise<void> {
        let modalData = new ServiceInvocationEditorModalData(title, invokableReporterId, invocation);
        const builder = new BSModalContextBuilder<ServiceInvocationEditorModalData>(
            modalData, undefined, ServiceInvocationEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        return this.modal.open(ServiceInvocationEditorModal, overlayConfig).result;
    }

}