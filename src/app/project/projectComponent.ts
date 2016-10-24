import {Component, OnInit, OnDestroy} from "@angular/core";
import {Router} from "@angular/router";
import {Observable} from 'rxjs/Observable';
import {ProjectServices} from "../services/projectServices";
import {MetadataServices} from "../services/metadataServices";
import {VocbenchCtx} from '../utils/VocbenchCtx';
import {VBEventHandler} from '../utils/VBEventHandler';
import {Project, ProjectTypesEnum} from '../utils/Project';
import {ModalServices} from "../widget/modal/modalServices";

@Component({
    selector: "project-component",
    templateUrl: "./projectComponent.html",
    host: { class : "pageComponent" }
})
export class ProjectComponent implements OnInit {
    private projectList: Project[];
    private selectedProject: Project; //project selected in the list
    
    private eventSubscriptions = [];
    
    constructor(private projectService: ProjectServices, private metadataService: MetadataServices,
        private vbCtx: VocbenchCtx, private router: Router, private eventHandler: VBEventHandler, private modalService: ModalServices) {
        this.eventSubscriptions.push(eventHandler.projectClosedEvent.subscribe(project => this.onProjectClosed(project)));
    }

    ngOnInit() {
        this.projectService.listProjects().subscribe(
            projectList => {
                this.projectList = projectList;
            }
        );
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    private selectProject(project: Project) {
        if (this.selectedProject == project) {
            this.selectedProject = null;
        } else {
            this.selectedProject = project;
        }
    }
    
    private accessProject(projectName: string) {
        var workingProj = this.vbCtx.getWorkingProject();
        if (workingProj == undefined || workingProj.getName() != projectName) {
            this.openProject(this.getProjectObjectFromName(projectName));
        }
    }

    /**
     * Redirects to the import project page
     */
    private createProject() {
        this.router.navigate(["/Projects/CreateProject"]);
    }

    private deleteProject() {
        if (this.selectedProject.isOpen()) {
            this.modalService.alert("Delete project", this.selectedProject.getName() + 
                    " is currently open. Please, close the project and then retry.", "warning");
            return;
        } else {
            this.modalService.confirm("Delete project", "Attention, this operation will delete the project " +
                    this.selectedProject.getName() + ". Are you sure to proceed?", "warning").then(
                result => {
                    this.vbCtx.removeProjectSetting(this.selectedProject);
                    this.projectService.deleteProject(this.selectedProject).subscribe(
                        stResp => {
                            for (var i = 0; i < this.projectList.length; i++) { //remove project from list
                                if (this.projectList[i].getName() == this.selectedProject.getName()) {
                                    this.projectList.splice(i, 1);
                                }
                            }
                            this.selectedProject = null;
                        }
                    );
                },
                () => {}
            );
        }
    }
    
    /**
     * Redirects to the import project page
     */
    private importProject() {
        this.router.navigate(["/Projects/ImportProject"]);
    }
    
    /**
     * Exports current selected project (only if it's open) as a zip archive
     */
    private exportProject() {
        if (!this.selectedProject.isOpen()) {
            this.modalService.alert("Export project", "You can export only open projects", "error");
            return;
        }
        this.projectService.exportProject(this.selectedProject).subscribe(
            stResp => {
                var data = new Blob([stResp], {type: "octet/stream"});
                var exportLink = window.URL.createObjectURL(data);
                this.modalService.downloadLink("Export project", null, exportLink, "export.zip");
            }
        );
    }
    
    private openOrCloseProject(project: Project) {
        if (project.isOpen()) {
            this.closeProject(project);
        } else {
            this.openProject(project);
        }
    }
    
    private openProject(project: Project) {
        document.getElementById("blockDivFullScreen").style.display = "block";
        this.projectService.accessProject(project).subscribe(
            stResp => {
                this.vbCtx.setWorkingProject(project);
                project.setOpen(true);
                document.getElementById("blockDivFullScreen").style.display = "none";
                //get default namespace of the project and set it to the vbContext
                this.metadataService.getDefaultNamespace().subscribe(
                    ns => {
                        this.vbCtx.setDefaultNamespace(ns);
                    }
                )
            },
            err => document.getElementById("blockDivFullScreen").style.display = "none"
        );
    }
    
    private closeProject(project: Project) {
        if (project.getType() == ProjectTypesEnum.saveToStore) {
            //if closing project is non-persistent ask to save
            this.modalService.confirm("Save project", "You're closing a non-persistent project " + project.getName()
                + ". Do you want to save changes?", "warning").then(
                confirm => {//save then disconnect
                    this.projectService.saveProject(project).subscribe(
                        stResp => {
                            this.disconnectFromProject(project);
                        }
                    );
                },
                () => {//disconnect without saving
                    this.disconnectFromProject(project);
                }
            );
        } else {//persistent project => just disconnect
            this.disconnectFromProject(project);
        }
    }
    
    /**
     * Calls the proper service in order to disconnect from the given project.
     * Returns an observable so I can disconnect and connect to a new project in synchronous way
     */
    private disconnectFromProject(project: Project) {
        document.getElementById("blockDivFullScreen").style.display = "block";
        this.projectService.disconnectFromProject(project).subscribe(
            stResp => {
                project.setOpen(false);
                document.getElementById("blockDivFullScreen").style.display = "none";
            },
            err => document.getElementById("blockDivFullScreen").style.display = "none"
        );
    }
    
    private saveProject(project: Project) {
        this.projectService.saveProject(project).subscribe(
            stResp => {
                this.modalService.alert("Save project", "Project " + project.getName() + " saved successfully");
            }
        );
    }
    
    /**
     * Useful to set as selected the radio button of the working project
     */
    private isWorkingProject(projectName: string): boolean {
        var workingProj = this.vbCtx.getWorkingProject();
        return (workingProj != undefined && workingProj.getName() == projectName);
    }
    
    /**
     * Useful to enable/disable the "Close all projects" button
     */
    private existOpenProject(): boolean {
        var foundOpen = false;
        for (var i = 0; i < this.projectList.length; i++) {
            if (this.projectList[i].isOpen()) {
                foundOpen = true;
                break;
            }
        }
        return foundOpen;
    }
    
    private getProjectObjectFromName(projectName: string): Project {
        return this.projectList.find(proj => proj.getName() == projectName);
    }
    
    
    //EVENT HANDLER
    
    /**
     * This event handler is useful when project data is cleared from the current page,
     * then there is need to update the UI
     */
    private onProjectClosed(project: Project) {
        for (var i = 0; i < this.projectList.length; i++) {
            if (this.projectList[i].getName() == project.getName()) {
                this.projectList[i].setOpen(false);
            }
        }
    }
    
}