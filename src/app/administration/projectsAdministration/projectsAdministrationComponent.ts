import { Component } from "@angular/core";
import { Project } from "../../models/Project";
import { ProjectServices } from "../../services/projectServices";

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
        this.projectService.listProjects().subscribe(
            projects => {
                this.projectList = projects;
            }
        );
    }

    private changeAspect(aspect: string) {
        this.selectedAspect = aspect;
        // this.selectedProject = null;
    }

    private selectProject(project: Project) {
        if (this.selectedProject != project) {
            this.selectedProject = project;
        }
    }

}