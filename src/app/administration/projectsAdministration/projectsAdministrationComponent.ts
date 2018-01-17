import { Component } from "@angular/core";
import { Project } from "../../models/Project";
import { ProjectServices } from "../../services/projectServices";
import { VBContext } from "../../utils/VBContext";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";

@Component({
    selector: "projects-admin-component",
    templateUrl: "./projectsAdministrationComponent.html",
    host: { class: "pageComponent" }
})
export class ProjectsAdministrationComponent {

    private projectList: Project[];
    private selectedProject: Project;

    private projUsersAspect: string = "Project-Users management";
    private projSettingsAspect: string = "Project settings";
    private aspectSelectors: string[] = [this.projUsersAspect, this.projSettingsAspect];
    private selectedAspect = this.aspectSelectors[0];

    constructor(private projectService: ProjectServices) { }

    ngOnInit() {
        if (this.isAdmin()) { //admin can manage all the project
            this.projectService.listProjects().subscribe(
                projects => {
                    this.projectList = projects;
                }
            );
        }
        //project manager can manage only the current project
        else if (AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.ADMINISTRATION_PROJECT_MANAGEMENT) &&
            AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.ADMINISTRATION_USER_ROLE_MANAGEMENT)) { 
            this.selectedProject = VBContext.getWorkingProject();
        }
    }

    private isAdmin(): boolean {
        return VBContext.getLoggedUser().isAdmin();
    }

    private changeAspect(aspect: string) {
        this.selectedAspect = aspect;
    }

    private selectProject(project: Project) {
        if (this.selectedProject != project) {
            this.selectedProject = project;
        }
    }

}