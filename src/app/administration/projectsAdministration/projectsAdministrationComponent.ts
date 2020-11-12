import { Component } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { Project } from "../../models/Project";
import { ACLEditorModal } from "../../project/projectACL/aclEditorModal";
import { ProjectServices } from "../../services/projectServices";
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

    private projectList: Project[];
    selectedProject: Project;

    projUsersAspect: string = "Project-Users management";
    projGroupsAspect: string = "Project-Groups management";
    projSettingsAspect: string = "Project settings";
    selectedAspect: string;

    constructor(private projectService: ProjectServices, private modalService: NgbModal) { }

    ngOnInit() {
        this.isAdminLogged = VBContext.getLoggedUser() && VBContext.getLoggedUser().isAdmin();

        if (this.isAdminLogged) { //admin can manage all the project
            this.projectService.listProjects().subscribe(
                projects => {
                    this.projectList = projects;
                }
            );
        }
        //project manager can manage only the current project
        else if (AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationProjectManagement) &&
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationUserRoleManagement)) { 
            this.selectedProject = VBContext.getWorkingProject();
        }
        if (this.isProjUserManagementAuthorized()) {
            this.selectedAspect = this.projUsersAspect;
        } else if (this.isProjGroupManagementAuthorized()) {
            this.selectedAspect = this.projGroupsAspect;
        } else {
            this.selectedAspect = this.projSettingsAspect;
        }
    }

    private selectProject(project: Project) {
        if (this.selectedProject != project) {
            this.selectedProject = project;
        }
    }

    editACL() {
        const modalRef: NgbModalRef = this.modalService.open(ACLEditorModal, new ModalOptions('sm'));
        modalRef.componentInstance.project = this.selectedProject;
    }

    isProjUserManagementAuthorized(): boolean {
        return (
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationUserRoleManagement) &&
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationUserGroupManagement)
        );
    }
    isProjGroupManagementAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationUserGroupManagement);
    }
    isProjSettingsAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationProjectManagement);
    }

}