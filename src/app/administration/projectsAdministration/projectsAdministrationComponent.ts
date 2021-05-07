import { Component } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { Project } from "../../models/Project";
import { ACLEditorModal } from "../../project/projectACL/aclEditorModal";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../../utils/VBActions";
import { VBContext } from "../../utils/VBContext";

@Component({
    selector: "projects-admin-component",
    templateUrl: "./projectsAdministrationComponent.html",
    host: { class: "pageComponent" }
})
export class ProjectsAdministrationComponent {

    isAdminLogged: boolean;

    selectedProject: Project;

    projUsersAspect: string = "Project-Users management";
    projGroupsAspect: string = "Project-Groups management";
    projSettingsAspect: string = "Project settings";
    selectedAspect: string;

    //authorizations
    isRoleMgmtAuthorized: boolean;
    isGroupMgmtAuthorized: boolean;
    isProjectMgmtAuthorized: boolean;

    constructor(private modalService: NgbModal) { }

    ngOnInit() {
        this.isAdminLogged = VBContext.getLoggedUser() && VBContext.getLoggedUser().isAdmin();

        this.isRoleMgmtAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationUserRoleManagement);
        this.isGroupMgmtAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationUserGroupManagement);
        this.isProjectMgmtAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationProjectManagement);

        if (!this.isAdminLogged && this.isProjectMgmtAuthorized && this.isRoleMgmtAuthorized) { 
            //project manager (non-admin) can manage only the current project
            this.selectedProject = VBContext.getWorkingProject();
        }
        if (this.isRoleMgmtAuthorized && this.isGroupMgmtAuthorized) {
            this.selectedAspect = this.projUsersAspect;
        } else if (this.isGroupMgmtAuthorized) {
            this.selectedAspect = this.projGroupsAspect;
        } else {
            this.selectedAspect = this.projSettingsAspect;
        }
    }

    selectProject(project: Project) {
        if (this.selectedProject != project) {
            this.selectedProject = project;
        }
    }

    editACL() {
        const modalRef: NgbModalRef = this.modalService.open(ACLEditorModal, new ModalOptions('sm'));
        modalRef.componentInstance.project = this.selectedProject;
    }

}