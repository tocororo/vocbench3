import { Component, HostListener } from '@angular/core';
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { CollaborationConfigModal } from "./collaborationConfigModal";
import { CollaborationServices } from "../services/collaborationServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: 'collaboration-component',
    templateUrl: './collaborationComponent.html',
    host: { class: "pageComponent" }
})
export class CollaborationComponent {

    constructor(private collaborationService: CollaborationServices, private sharedModals: SharedModalServices, private modal: Modal) {}


    private openConfig() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };

        this.modal.open(CollaborationConfigModal, overlayConfig).result.then();
    }

    private createProject() {
        console.log("create project");
    }

    private assignProject() {
        console.log("assign project");
    }

}