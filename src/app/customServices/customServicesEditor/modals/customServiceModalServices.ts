import { Injectable } from '@angular/core';
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { CustomOperationDefinition, CustomService } from '../../../models/CustomService';
import { CustomOperationEditorModal, CustomOperationEditorModalData } from './customOperationEditorModal';
import { CustomOperationModal, CustomOperationModalData } from './customOperationModal';
import { CustomServiceEditorModal, CustomServiceEditorModalData } from './customServiceEditorModal';


@Injectable()
export class CustomServiceModalServices {

    constructor(private modal: Modal) { }

    public openCustomServiceEditor(title: string, serviceConf?: CustomService): Promise<void> {
        let modalData = new CustomServiceEditorModalData(title, serviceConf);
        const builder = new BSModalContextBuilder<CustomServiceEditorModalData>(
            modalData, undefined, CustomServiceEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(CustomServiceEditorModal, overlayConfig).result;
    }

    public openCustomOperationEditor(title: string, customServiceId: string, operation?: CustomOperationDefinition): Promise<void> {
        let modalData = new CustomOperationEditorModalData(title, customServiceId, operation);
        const builder = new BSModalContextBuilder<CustomOperationEditorModalData>(
            modalData, undefined, CustomOperationEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        return this.modal.open(CustomOperationEditorModal, overlayConfig).result;
    }

    public openCustomOperationView(operation: CustomOperationDefinition): Promise<void> {
        let modalData = new CustomOperationModalData(operation);
        const builder = new BSModalContextBuilder<CustomOperationModalData>(
            modalData, undefined, CustomOperationModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        return this.modal.open(CustomOperationModal, overlayConfig).result;
    }

}