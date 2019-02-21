import { Component } from "@angular/core";
import { Project } from "../../models/Project";
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

    private isAdminLogged: boolean;

    private projectList: Project[];
    private selectedProject: Project;

    private projUsersAspect: string = "Project-Users management";
    private projGroupsAspect: string = "Project-Groups management";
    private projSettingsAspect: string = "Project settings";
    private selectedAspect: string;

    constructor(private projectService: ProjectServices) { }

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

    private isProjUserManagementAuthorized(): boolean {
        return (
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationUserRoleManagement) &&
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationUserGroupManagement)
        );
    }
    private isProjGroupManagementAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationUserGroupManagement);
    }
    private isProjSettingsAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.administrationProjectManagement);
    }

}