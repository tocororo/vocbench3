import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Project, ProjectViewMode } from '../models/Project';
import { MetadataServices } from "../services/metadataServices";
import { ProjectServices } from "../services/projectServices";
import { UserServices } from "../services/userServices";
import { Cookie } from "../utils/Cookie";
import { DatatypeValidator } from "../utils/DatatypeValidator";
import { VBCollaboration } from '../utils/VBCollaboration';
import { VBProperties } from '../utils/VBProperties';
import { AbstractProjectComponent } from "./abstractProjectComponent";

@Component({
    selector: "project-list-modal",
    templateUrl: "./projectListModal.html",
})
export class ProjectListModal extends AbstractProjectComponent implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private selectedProject: Project;

    constructor(public dialog: DialogRef<BSModalContext>, userService: UserServices, metadataService: MetadataServices,
        vbCollaboration: VBCollaboration, vbProp: VBProperties, dtValidator: DatatypeValidator,
        private projectService: ProjectServices, private router: Router) {
        super(userService, metadataService, vbCollaboration, vbProp, dtValidator);
        this.context = dialog.context;
    }

    initProjects() {
        //init visualization mode
        this.visualizationMode = Cookie.getCookie(Cookie.PROJECT_VIEW_MODE) == ProjectViewMode.dir ? ProjectViewMode.dir : ProjectViewMode.list;
        
        this.projectService.listProjects(null, true).subscribe(
            projects => {
                this.projectList = [];
                for (var i = 0; i < projects.length; i++) {
                    if (projects[i].isOpen()) {
                        this.projectList.push(projects[i]);
                    }
                }

                this.initProjectDirectories();
            }
        );
    }

    selectProject(project: Project) {
        if (!this.isWorkingProject(project)) {
            this.selectedProject = project;
        }
    }

    private isAccessClickable() {
        return (this.selectedProject != null && !this.isWorkingProject(this.selectedProject));
    }

    private changeVisualizationMode(mode: ProjectViewMode) {
        this.visualizationMode = mode;
        Cookie.setCookie(Cookie.PROJECT_VIEW_MODE, mode);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
        this.router.navigate(['/Home']).then(
            () => {
                this.accessProject(this.selectedProject).subscribe()
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}