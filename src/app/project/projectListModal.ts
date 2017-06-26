import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { ProjectServices } from "../services/projectServices";
import { UserServices } from "../services/userServices";
import { MetadataServices } from "../services/metadataServices";
import { Project } from '../models/Project';
import { VBContext } from '../utils/VBContext';
import { VBPreferences } from '../utils/VBPreferences';
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
        private userService: UserServices, private preferences: VBPreferences, private router: Router) {
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
                this.preferences.initUserProjectPreferences();
                VBContext.setWorkingProject(this.selectedProject);
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
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