import { Component, EventEmitter, Input, Output } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Project } from "src/app/models/Project";
import { ProjectServices } from "src/app/services/projectServices";

@Component({
    selector: "project-list",
    templateUrl: "./projectListComponent.html",
    host: { class: "vbox" }
})
export class ProjectListComponent {

    @Input() consumer: Project;
    @Input() userDependent: boolean;
    @Input() onlyOpen: boolean;
    
    @Output() projectSelected: EventEmitter<Project> = new EventEmitter();

    projects: Project[];
    selectedProject: Project;

    constructor(private projectService: ProjectServices, private translateService: TranslateService) {}

    ngOnInit() {
        this.projectService.listProjects(this.consumer, this.userDependent, this.onlyOpen).subscribe(
            projects => {
                this.projects = projects;
            }
        )
    }

    selectProject(project: Project) {
        this.selectedProject = project;
        this.projectSelected.emit(this.selectedProject);
    }

}
