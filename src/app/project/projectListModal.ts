import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Project } from '../models/Project';
import { MetadataServices } from "../services/metadataServices";
import { ProjectServices } from "../services/projectServices";
import { UserServices } from "../services/userServices";
import { VBCollaboration } from '../utils/VBCollaboration';
import { VBProperties } from '../utils/VBProperties';
import { AbstractProjectComponent } from "./abstractProjectComponent";

@Component({
    selector: "project-list-modal",
    templateUrl: "./projectListModal.html",
})
export class ProjectListModal extends AbstractProjectComponent implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private projectList: Array<Project> = [];
    private selectedProject: Project;

    constructor(public dialog: DialogRef<BSModalContext>, userService: UserServices, metadataService: MetadataServices,
        vbCollaboration: VBCollaboration, vbProp: VBProperties, private projectService: ProjectServices, private router: Router) {
        super(userService, metadataService, vbCollaboration, vbProp);
        this.context = dialog.context;
    }

    ngOnInit() {
        this.projectService.listProjects(null, true).subscribe(
            projects => {
                for (var i = 0; i < projects.length; i++) {
                    if (projects[i].isOpen()) {
                        this.projectList.push(projects[i]);
                    }
                }
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

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
        // let currentRoute = this.router.url;
        this.router.navigate(['/Home']).then(
            success => {
                this.accessProject(this.selectedProject).subscribe(
            //         () => {
            //             this.router.navigate([currentRoute]);
            //         }
                )
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}