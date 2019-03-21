import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { VBProperties } from "../../utils/VBProperties";

@Component({
    selector: "data-graph-settings-modal",
    templateUrl: "./dataGraphSettingsModal.html",
})
export class DataGraphSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private hideLiteralNodes: boolean;

    constructor(public dialog: DialogRef<BSModalContext>, private vbProp: VBProperties) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.hideLiteralNodes = this.vbProp.getHideLiteralGraphNodes();
    }

    private onHideLiteralChange() {
        this.vbProp.setHideLiteralGraphNodes(this.hideLiteralNodes);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}