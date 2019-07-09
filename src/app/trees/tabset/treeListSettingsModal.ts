import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { VBProperties } from "../../utils/VBProperties";
import { VBEventHandler } from "../../utils/VBEventHandler";

@Component({
    selector: "tree-list-settings-modal",
    templateUrl: "./treeListSettingsModal.html",
})
export class TreeListSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private showDeprecated: boolean;

    constructor(public dialog: DialogRef<BSModalContext>, private vbProp: VBProperties, private eventHandler: VBEventHandler) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.showDeprecated = this.vbProp.getShowDeprecated();
    }

    onShowDeprecatedChange() {
        this.vbProp.setShowDeprecated(this.showDeprecated);
        this.eventHandler.showDeprecatedChangedEvent.emit(this.showDeprecated);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}