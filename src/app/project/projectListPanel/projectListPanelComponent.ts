import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Project, ProjectLabelCtx } from "src/app/models/Project";
import { ProjectServices } from "src/app/services/projectServices";
import { Cookie } from 'src/app/utils/Cookie';

@Component({
    selector: "project-list-panel",
    templateUrl: "./projectListPanelComponent.html",
    host: { class: "vbox" }
})
export class ProjectListPanelComponent {

    @Input() consumer: Project;
    @Input() userDependent: boolean;
    @Input() onlyOpen: boolean;
    
    @Output() projectSelected: EventEmitter<Project> = new EventEmitter();

    projects: Project[];
    selectedProject: Project;
    
    rendering: boolean;

    nameFilter: string = "";

    constructor(private projectService: ProjectServices) {}

    ngOnInit() {
        this.rendering = Cookie.getCookie(Cookie.PROJECT_RENDERING) == "true";

        this.projectService.listProjects(this.consumer, this.userDependent, this.onlyOpen).subscribe(
            projects => {
                this.projects = projects;
            }
        );
    }

    switchRendering() {
        this.rendering = !this.rendering;
        Cookie.setCookie(Cookie.PROJECT_RENDERING, this.rendering + "");
        ProjectLabelCtx.renderingEnabled = this.rendering;
    }

    selectProject(project: Project) {
        this.selectedProject = project;
        this.projectSelected.emit(this.selectedProject);
    }

    isProjectVisible(project: Project): boolean {
        return this.nameFilter == "" || project.getName(this.rendering).toLocaleLowerCase().includes(this.nameFilter.toLocaleLowerCase());
    }

}
