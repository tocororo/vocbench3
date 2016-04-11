import {Component, OnInit, OnDestroy} from "angular2/core";
import {Router} from 'angular2/router';
import {Observable} from 'rxjs/Observable';
import {ProjectServices} from "../services/projectServices";
import {VocbenchCtx} from '../utils/VocbenchCtx';
import {Project} from '../utils/Project';
import {ModalServices} from "../widget/modal/modalServices";

@Component({
    selector: "project-component",
    templateUrl: "app/src/project/projectComponent.html",
    providers: [ProjectServices],
    host: { class : "pageComponent" }
})
export class ProjectComponent implements OnInit {
    private projectList: Project[];
    private currentProject: Project; //project currently open
    private selectedProject: Project; //project selected in the list
    
    private exportLink: string;

    constructor(private projectService: ProjectServices, private vbCtx: VocbenchCtx, private router: Router,
        private modalService: ModalServices) {
        // navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        }        
    }

    ngOnInit() {
        this.projectService.listProjects().subscribe(
            projectList => {
                this.projectList = projectList;
                //Init closing potential multiple open projects. If just one, connect to it.
                var ctxProject = this.vbCtx.getProject();
                var openProjectList: Project[] = [];
                if (ctxProject == undefined) { //no project in context (first start or all projects are closed)
                    for (var i = 0; i < this.projectList.length; i++) { //collect projects remained open (in case of first start)
                        if (this.projectList[i].isOpen()) {
                            openProjectList.push(this.projectList[i]);
                        }
                    }
                    if (openProjectList.length == 1) { //just one open project => connect to it
                        this.connectToProject(openProjectList[0]);
                    } else if (openProjectList.length > 1) { //multiple open projects
                        for (var i = 0; i < openProjectList.length; i++) { //close all open projects
                            this.disconnectFromProject(openProjectList[i]);
                        }
                    }
                }
            },
            err => { }
        );
    }

    private selectProject(project) {
        this.selectedProject = project;
    }

    private isSelected(project) {
        return this.selectedProject == project;
    }
    
    /**
     * Redirects to the import project page
     */
    private createProject() {
        this.router.navigate(["CreateProject"]);
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
                    this.projectService.deleteProject(this.selectedProject).subscribe(
                        stResp => {
                            for (var i = 0; i < this.projectList.length; i++) { //remove project from list
                                if (this.projectList[i].getName() == this.selectedProject.getName()) {
                                    this.projectList.splice(i, 1);
                                }
                            }
                            this.selectedProject = null;
                        },
                        err => { }
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
        this.router.navigate(["ImportProject"]);
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
                this.exportLink = window.URL.createObjectURL(data);
            },
            err => { }
        );
    }

    private openProject(project: Project) {
        var ctxProject = this.vbCtx.getProject();
        if (ctxProject != undefined) { //a project is already open
            //first disconnect from old project
            this.saveAndCloseProject(ctxProject).subscribe(
                stResp => {//then connect to the new project
                    this.connectToProject(project);
                }
            );
        } else { //no project open, open new project
            this.connectToProject(project);
        }
    }
    
    /**
     * Called when double clicking on "open folder" icon. Call in turn saveAndCloseProject.
     * I cannot invoke directly saveAndCloseProject from the view cause I need to subscribe to the
     * observable in order to execute the observable code.
     */
    private closeProject(project: Project) {
        this.saveAndCloseProject(project).subscribe();
    }

    /**
     * Performs checks on persistent/non-persistent status, so eventually saves the project and then closes it.
     * Returns an observable so I can disconnect and connect to a new project in synchronous way
     */
    private saveAndCloseProject(project: Project) {
        return new Observable(observer => {
            if (project.getType() == "saveToStore") {
                //if closing project is non-persistent ask to save
                this.modalService.confirm("Save project", "You're closing a non-persistent project " + project.getName() 
                    + ". Do you want to save changes?", "warning").then(
                        
                    confirm => {//save then disconnect
                        this.projectService.saveProject(project).subscribe(
                            stResp => {
                                this.disconnectFromProject(project).subscribe(
                                    stResp => {
                                        observer.next(stResp);
                                        observer.complete();
                                    }
                                );
                            }
                        );
                    },
                    () => {//disconnect without saving
                        this.disconnectFromProject(project).subscribe(
                            stResp => {
                                observer.next(stResp);
                                observer.complete();    
                            }
                        );
                    }
                );
            } else {//persisten project => just disconnect
                this.disconnectFromProject(project).subscribe(
                    stResp => {
                        observer.next(stResp);
                        observer.complete();      
                    }
                );
            }
        });
    }
    
    /**
     * Calls the proper service in order to connect to the given project
     */
    private connectToProject(project: Project) {
        document.getElementById("blockDivFullScreen").style.display = "block";
        this.projectService.accessProject(project).subscribe(
            stResp => {
                this.vbCtx.setProject(project);
                project.setOpen(true);
                document.getElementById("blockDivFullScreen").style.display = "none";
            },
            err => document.getElementById("blockDivFullScreen").style.display = "none"
        );
    }

    /**
     * Calls the proper service in order to disconnect from the given project.
     * Returns an observable so I can disconnect and connect to a new project in synchronous way
     */
    private disconnectFromProject(project: Project) {
        return new Observable(observer => {
            document.getElementById("blockDivFullScreen").style.display = "block";
            this.projectService.disconnectFromProject(project).subscribe(
                stResp => {
                    this.vbCtx.setProject(undefined);
                    this.vbCtx.removeScheme();
                    project.setOpen(false);
                    document.getElementById("blockDivFullScreen").style.display = "none";
                    observer.next(stResp);
                    observer.complete();
                },
                err => document.getElementById("blockDivFullScreen").style.display = "none"
            );
        });
    }
    
}