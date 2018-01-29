import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { AbstractProjectComponent } from "./abstractProjectComponent";
import { ProjectServices } from "../services/projectServices";
import { UserServices } from "../services/userServices";
import { AdministrationServices } from "../services/administrationServices";
import { CollaborationServices } from "../services/collaborationServices";
import { MetadataServices } from "../services/metadataServices";
import { Project } from '../models/Project';
import { CollaborationCtx } from '../models/Collaboration';
import { VBContext } from '../utils/VBContext';
import { VBProperties } from '../utils/VBProperties';
import { UIUtils } from '../utils/UIUtils';

@Component({
    selector: "project-list-modal",
    templateUrl: "./projectListModal.html",
})
export class ProjectListModal extends AbstractProjectComponent implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private projectList: Array<Project> = [];
    private selectedProject: Project;

    constructor(public dialog: DialogRef<BSModalContext>,
        adminService: AdministrationServices, userService: UserServices, collaborationService: CollaborationServices,
        metadataService: MetadataServices, vbProp: VBProperties, private projectService: ProjectServices, private router: Router) {
        super(adminService, userService, metadataService, collaborationService, vbProp);
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
        this.accessProject(this.selectedProject).subscribe(
            res => {
                var currentRoute = this.router.url;
                this.router.navigate(['/Home']).then(
                    success => {
                        this.router.navigate([currentRoute]);
                    }
                );
            }
        );
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }

}