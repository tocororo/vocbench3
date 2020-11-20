import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VBEventHandler } from "../../utils/VBEventHandler";
import { VBProperties } from "../../utils/VBProperties";

@Component({
    selector: "tree-list-settings-modal",
    templateUrl: "./treeListSettingsModal.html",
})
export class TreeListSettingsModal {

    showDeprecated: boolean;

    constructor(public activeModal: NgbActiveModal, private vbProp: VBProperties, private eventHandler: VBEventHandler) {}

    ngOnInit() {
        this.showDeprecated = this.vbProp.getShowDeprecated();
    }

    onShowDeprecatedChange() {
        this.vbProp.setShowDeprecated(this.showDeprecated);
        this.eventHandler.showDeprecatedChangedEvent.emit(this.showDeprecated);
    }

    ok() {
        this.activeModal.close();
    }

}