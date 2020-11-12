import { Injectable } from '@angular/core';
import { CollaborationProjSettingsModal } from "./modals/collaborationProjSettingsModal";
import { CollaborationUserSettingsModal } from "./modals/collaborationUserSettingsModal";
import { CollaborationProjectModal } from "./modals/collaborationProjectModal";
import { CreateIssueModal } from "./modals/createIssueModal";
import { IssueListModal } from "./issueListModal";
import { Issue } from '../models/Collaboration';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from '../widget/modal/Modals';

/**
 * Service to open modals that allow to create a classes list or instances list
 */
@Injectable()
export class CollaborationModalServices {

    constructor(private modalService: NgbModal) { }

    /**
     * Opens a modal to list the collaboration system issues and select one
     * @return if the modal closes with ok returns an Issue
     */
    openIssueList(): Promise<Issue> {
        return this.modalService.open(IssueListModal, new ModalOptions()).result;
    }

    /**
     * Opens a modal to edit the collaboration system project settings
     */
    editCollaborationProjectSettings() {
        return this.modalService.open(CollaborationProjSettingsModal, new ModalOptions()).result;
    }

    /**
     * Opens a modal to edit the collaboration system user settings
     */
    editCollaborationUserSettings() {
        return this.modalService.open(CollaborationUserSettingsModal, new ModalOptions()).result;
    }

    /**
     * Opens a modal to create or assign a collaboration project
     */
    editCollaborationProject() {
        return this.modalService.open(CollaborationProjectModal, new ModalOptions()).result;
    }

    /**
     * 
     */
    createIssue() {
        return this.modalService.open(CreateIssueModal, new ModalOptions()).result;
    }

}