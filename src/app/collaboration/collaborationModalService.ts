import { Injectable } from '@angular/core';
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { CollaborationConfigModal } from "./collaborationConfigModal";
import { CollaborationProjectModal } from "./collaborationProjectModal";
import { IssueListModal } from "./issueListModal";
import { Issue } from '../models/Collaboration';

/**
 * Service to open modals that allow to create a classes list or instances list
 */
@Injectable()
export class CollaborationModalServices {

    constructor(private modal: Modal) { }

    /**
     * Opens a modal to list the collaboration system issues and select one
     * @return if the modal closes with ok returns an Issue
     */
    openIssueList(): Promise<Issue> {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(IssueListModal, overlayConfig).result;
    }

    /**
     * Opens a modal to edit the collaboration system configuration
     */
    editCollaborationConfig() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        this.modal.open(CollaborationConfigModal, overlayConfig).result;
    }

    /**
     * Opens a modal to create or assign a collaboration project
     */
    editCollaborationProject() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        this.modal.open(CollaborationProjectModal, overlayConfig).result;
    }

}