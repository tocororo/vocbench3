import {Component, OnInit, OnDestroy} from "angular2/core";
import {ProjectServices} from "../services/projectServices";
import {VocbenchCtx} from '../utils/VocbenchCtx';
import {Project} from '../utils/Project';

@Component({
    selector: "project-component",
    templateUrl: "app/src/project/projectComponent.html",
    providers: [ProjectServices],
})
export class ProjectComponent implements OnInit {
    private projectList: Project[];
    private currentProject: Project; //project currently open
    private selectedProject: Project; //project selected in the list

    constructor(private projectService: ProjectServices, private vbCtx: VocbenchCtx) {}

    ngOnInit() {
        this.projectService.listProjects().subscribe(
            stResp => {
                var projColl = stResp.getElementsByTagName("project");
                this.projectList = [];
                for (var i = 0; i < projColl.length; i++) {
                    var proj = new Project();
                    proj.setAccessible(projColl[i].getAttribute("accessible") == "true");
                    proj.setModelConfigType(projColl[i].getAttribute("modelConfigType"));
                    proj.setOntoMgr(projColl[i].getAttribute("ontmgr"));
                    proj.setOntoType(projColl[i].getAttribute("ontoType"));
                    proj.setOpen(projColl[i].getAttribute("open") == "true");
                    var status: any = new Object();
                    var hasIssues = projColl[i].getAttribute("status") != "ok";
                    if (hasIssues) {
                        status.class = "glyphicon glyphicon-exclamation-sign";
                        status.message = projColl[i].getAttribute("stMsg");
                    } else {
                        status.class = "glyphicon glyphicon-ok-circle";
                        status.message = projColl[i].getAttribute("status");
                    }
                    proj.setStatus(status);
                    proj.setType(projColl[i].getAttribute("type"));
                    proj.setName(projColl[i].textContent);
                    this.projectList.push(proj);
                }
                    
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
            err => {
                alert("Error: " + err);
                console.error(err.stack);
            });
    }

    private selectProject(project) {
        this.selectedProject = project;
    }

    private isSelected(project) {
        return this.selectedProject == project;
    }
    
    //TODO
    private createProject() {
        alert("create project");
    }

    private deleteProject() {
        if (this.selectedProject.isOpen()) {
            alert(this.selectedProject.getName() + " is currently open. Please, close the project and then retry.");
            return;
        } else {
            this.projectService.deleteProject(this.selectedProject.getName()).subscribe(
                stResp => {
                    for (var i = 0; i < this.projectList.length; i++) { //remove project from list
                        if (this.projectList[i].getName() == this.selectedProject.getName()) {
                            this.projectList.splice(i, 1);
                        }
                    }
                    this.selectedProject = null;
                },
                err => {
                    alert("Error: " + err);
                    console.error(err.stack);
                })
        }
    }
    
    //TODO
    private importProject() {
        alert("import project");
    }

    private openProject(project: Project) {
        var ctxProject = this.vbCtx.getProject();
        if (ctxProject != undefined) { //a project is already open
            //first disconnect from old project
            //(don't call this.closeProject cause I need to execute connectToProject in syncronous way)
            document.getElementById("blockDivFullScreen").style.display = "block";
            this.projectService.disconnectFromProject(ctxProject.getName()).subscribe(
                stResp => {
                    document.getElementById("blockDivFullScreen").style.display = "none";
                    this.getProjectFromList(ctxProject.getName()).setOpen(false); //set as close the previous open project
                    this.vbCtx.setProject(undefined);
                    this.vbCtx.removeScheme();
                    //then connect to the new one
                    this.connectToProject(project);
                },
                err => {
                    alert("Error: " + err);
                    console.error(err.stack);
                    document.getElementById("blockDivFullScreen").style.display = "none";
                });
        } else { //no project open
            this.connectToProject(project);
        }
    }

    private closeProject(project: Project) {
        this.disconnectFromProject(project);
    }
    
    private connectToProject(project: Project) {
        document.getElementById("blockDivFullScreen").style.display = "block";
        this.projectService.accessProject(project.getName()).subscribe(
            stResp => {
                this.vbCtx.setProject(project);
                project.setOpen(true);
            },
            err => {
                alert("Error: " + err);
                console.error(err.stack);
            },
            () => document.getElementById("blockDivFullScreen").style.display = "none");
    }

    private disconnectFromProject(project: Project) {
        document.getElementById("blockDivFullScreen").style.display = "block";
        this.projectService.disconnectFromProject(project.getName()).subscribe(
            stResp => {
                this.vbCtx.setProject(undefined);
                this.vbCtx.removeScheme();
                project.setOpen(false);
            },
            err => {
                alert("Error: " + err);
                console.error(err.stack);
            },
            () => document.getElementById("blockDivFullScreen").style.display = "none");
    }
    
    // get the project from projectList with the given name
    private getProjectFromList(projName): Project {
        for (var i = 0; i < this.projectList.length; i++) {
            if (this.projectList[i].getName() == projName) {
                return this.projectList[i];
            }
        }
    }

}