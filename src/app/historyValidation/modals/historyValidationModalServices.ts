import { Injectable } from "@angular/core";
import { Modal, OverlayConfig } from "ngx-modialog";
import { CommitInfo } from "../../models/History";
import { CommitDeltaModal, CommitDeltaModalData } from "./commitDeltaModal";
import { OperationParamsModal, OperationParamsModalData } from "./operationParamsModal";
import { BSModalContextBuilder } from "ngx-modialog/plugins/bootstrap";

@Injectable()
export class HistoryValidationModalServices {

    constructor(private modal: Modal) { }

    inspectParams(item: CommitInfo) {
        var modalData = new OperationParamsModalData(item);
        const builder = new BSModalContextBuilder<OperationParamsModalData>(
            modalData, undefined, OperationParamsModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(OperationParamsModal, overlayConfig);
    }

    getCommitDelta(item: CommitInfo) {
        var modalData = new CommitDeltaModalData(item.commit);
        const builder = new BSModalContextBuilder<CommitDeltaModalData>(
            modalData, undefined, CommitDeltaModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('lg').keyboard(27).toJSON() };
        return this.modal.open(CommitDeltaModal, overlayConfig);
    }

}