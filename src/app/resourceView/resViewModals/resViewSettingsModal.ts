import { Component, Input } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { VBProperties, ResourceViewMode } from "../../utils/VBProperties";
import { VBEventHandler } from "../../utils/VBEventHandler";

@Component({
    selector: "res-view-settings-modal",
    templateUrl: "./resViewSettingsModal.html",
})
export class ResViewSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private tabSync: boolean;
    private mode: ResourceViewMode;

    constructor(public dialog: DialogRef<BSModalContext>, private vbProp: VBProperties, private eventHandler: VBEventHandler) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.mode = this.vbProp.getResourceViewMode();
        this.tabSync = this.vbProp.getResourceViewTabSync();
    }

    ok(event: Event) {
        this.vbProp.setResourceViewMode(this.mode);
        this.eventHandler.resViewModeChangedEvent.emit(this.mode);
        this.vbProp.setResourceViewTabSync(this.tabSync);
        this.eventHandler.resViewTabSyncChangedEvent.emit(this.tabSync);

        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}