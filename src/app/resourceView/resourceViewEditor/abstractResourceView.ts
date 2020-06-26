import { Modal, OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder } from "ngx-modialog/plugins/bootstrap";
import { ResourceViewServices } from "../../services/resourceViewServices";
import { ResViewSettingsModal } from "../resViewSettingsModal";

export abstract class AbstractResourceView {

    protected resViewService: ResourceViewServices;
    protected modal: Modal;
    constructor(resViewService: ResourceViewServices, modal: Modal) {
        this.resViewService = resViewService;
        this.modal = modal;
    }

    /**
     * Opens a modal that allows to edit the resource view settings
     */
    openSettings() {
        const builder = new BSModalContextBuilder<any>();
        // let overlayConfig: OverlayConfig = { context: builder.keyboard(27).dialogClass("modal-dialog modal-xl").toJSON() };
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        return this.modal.open(ResViewSettingsModal, overlayConfig).result;
    }
}