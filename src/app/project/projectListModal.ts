import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { AbstractProjectComponent } from "./abstractProjectComponent";
import { ProjectServices } from "../services/projectServices";
import { UserServices } from "../services/userServices";
import { AdministrationServices } from "../services/administrationServices";
import { MetadataServices } from "../services/metadataServices";
import { Project } from '../models/Project';
import { VBContext } from '../utils/VBContext';
import { VBProperties } from '../utils/VBProperties';
import { VBCollaboration } from '../utils/VBCollaboration';
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
        adminService: AdministrationServices, userService: UserServices, metadataService: MetadataServices,
        vbCollaboration: VBCollaboration, vbProp: VBProperties, private projectService: ProjectServices, private router: Router) {
        super(adminService, userService, metadataService, vbCollaboration, vbProp);
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