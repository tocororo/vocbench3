import { Injectable } from '@angular/core';
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { CollaborationProjSettingsModal } from "./modals/collaborationProjSettingsModal";
import { CollaborationUserSettingsModal } from "./modals/collaborationUserSettingsModal";
import { CollaborationProjectModal } from "./modals/collaborationProjectModal";
import { CreateIssueModal } from "./modals/createIssueModal";
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
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(IssueListModal, overlayConfig).result;
    }

    /**
     * Opens a modal to edit the collaboration system project settings
     */
    editCollaborationProjectSettings() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(CollaborationProjSettingsModal, overlayConfig).result;
    }

    /**
     * Opens a modal to edit the collaboration system user settings
     */
    editCollaborationUserSettings() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(CollaborationUserSettingsModal, overlayConfig).result;
    }

    /**
     * Opens a modal to create or assign a collaboration project
     */
    editCollaborationProject() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(CollaborationProjectModal, overlayConfig).result;
    }

    /**
     * 
     */
    createIssue() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(CreateIssueModal, overlayConfig).result;
    }

}