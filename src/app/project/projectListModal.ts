import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { ProjectServices } from "../services/projectServices";
import { UserServices } from "../services/userServices";
import { AdministrationServices } from "../services/administrationServices";
import { MetadataServices } from "../services/metadataServices";
import { Project } from '../models/Project';
import { VBContext } from '../utils/VBContext';
import { VBProperties } from '../utils/VBProperties';
import { UIUtils } from '../utils/UIUtils';
import { ModalContext } from '../widget/modal/ModalContext';

@Component({
    selector: "project-list-modal",
    templateUrl: "./projectListModal.html",
})
export class ProjectListModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private workingProject: Project;
    private projectList: Array<Project> = [];
    private selectedProject: Project;

    constructor(public dialog: DialogRef<BSModalContext>, private projectService: ProjectServices, private metadataService: MetadataServices,
        private adminService: AdministrationServices, private userService: UserServices, private vbProp: VBProperties,
        private router: Router) {
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
        this.workingProject = VBContext.getWorkingProject();
    }

    private selectProject(project: Project) {
        if (!this.isWorkingProject(project)) {
            this.selectedProject = project;
        }
    }

    private accessProject() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.projectService.accessProject(this.selectedProject).subscribe(
            stResp => {
                VBContext.setWorkingProject(this.selectedProject);
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.vbProp.initUserProjectPreferences();
                this.vbProp.initProjectSettings();
                this.adminService.getProjectUserBinding(this.selectedProject.getName(), VBContext.getLoggedUser().getEmail()).subscribe(
                    puBinding => {
                        VBContext.setProjectUserBinding(puBinding);
                    }
                );
                Observable.forkJoin(
                    //init the project preferences for the project
                    this.userService.listUserCapabilities(),
                    this.metadataService.getNamespaceMappings()
                ).subscribe(
                    res => {
                        VBContext.setProjectChanged(true);
                        var currentRoute = this.router.url;
                        this.router.navigate(['/Home']).then(
                            success => {
                                this.router.navigate([currentRoute]);
                            }
                        );
                    }
                );
            }
        );
    }

    private isWorkingProject(project: Project) {
        if (this.workingProject != null) {
            return project.getName() == this.workingProject.getName();
        } else {
            return false;
        }
    }

    private isAccessClickable() {
        return (this.selectedProject != null && !this.isWorkingProject(this.selectedProject));
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.accessProject();
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }

}