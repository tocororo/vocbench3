import { Component, Input } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { VBProperties } from "../../utils/VBProperties";
import { VBEventHandler } from "../../utils/VBEventHandler";
import { ResourceViewMode } from "../../models/Properties";

@Component({
    selector: "res-view-settings-modal",
    templateUrl: "./resViewSettingsModal.html",
})
export class ResViewSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private tabSync: boolean;
    private tabSyncPristine: boolean;

    private mode: ResourceViewMode;
    private modePristine: ResourceViewMode;

    constructor(public dialog: DialogRef<BSModalContext>, private vbProp: VBProperties, private eventHandler: VBEventHandler) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.mode = this.vbProp.getResourceViewMode();
        this.modePristine = this.mode;
        this.tabSync = this.vbProp.getResourceViewTabSync();
        this.tabSyncPristine = this.tabSync;
    }

    ok(event: Event) {
        if (this.mode != this.modePristine) {
            this.vbProp.setResourceViewMode(this.mode);
            this.eventHandler.resViewModeChangedEvent.emit({ mode: this.mode, fromVbPref: false });
        }
        if (this.tabSync != this.tabSyncPristine) {
            this.vbProp.setResourceViewTabSync(this.tabSync);
            this.eventHandler.resViewTabSyncChangedEvent.emit(this.tabSync);
        }
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}