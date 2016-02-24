import {Component, OnInit, OnDestroy} from "angular2/core";
import {ProjectServices} from "../services/projectServices";
import {VocbenchCtx} from '../utils/VocbenchCtx';

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
                var ctxProjectName = this.vbCtx.getProject();
                var openProjectList: Project[] = [];
                if (ctxProjectName == "SYSTEM") { //project in context is SYSTEM (probably first start)
                    for (var i = 0; i < this.projectList.length; i++) { //collect projects remained open
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
        var ctxProject = this.getProjectObject(this.vbCtx.getProject());
        if (ctxProject.getName() != "SYSTEM") { //a project is already open
            //first disconnect from old project
            //(don't call this.closeProject cause I need to execute connectToProject in syncronous way)
            document.getElementById("blockDivFullScreen").style.display = "block";
            this.projectService.disconnectFromProject(ctxProject.getName()).subscribe(
                stResp => {
                    document.getElementById("blockDivFullScreen").style.display = "none";
                    ctxProject.setOpen(false);
                    this.vbCtx.setProject("SYSTEM");
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
                this.vbCtx.setProject(project.getName());
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
                this.vbCtx.setProject("SYSTEM");
                this.vbCtx.removeScheme();
                project.setOpen(false);
            },
            err => {
                alert("Error: " + err);
                console.error(err.stack);
            },
            () => document.getElementById("blockDivFullScreen").style.display = "none");
    }
    
    //get the project object from projectList with the given name
    private getProjectObject(projName): Project {
        for (var i = 0; i < this.projectList.length; i++) {
            if (this.projectList[i].getName() == projName) {
                return this.projectList[i];
            }
        }
        return new Project("SYSTEM");
    }

}

class Project {
    private name: string;
    private accessible: boolean;
    private modelConfigType: string;
    private ontmgr: string;
    private ontoType: string;
    private open: boolean;
    private status: Object;
    private type: string;
    
    private knownRDFModelInterfaces = {
        "it.uniroma2.art.owlart.models.RDFModel" : "RDF",
        "it.uniroma2.art.owlart.models.RDFSModel" : "RDFS",
        "it.uniroma2.art.owlart.models.OWLModel" : "OWL",
        "it.uniroma2.art.owlart.models.SKOSModel" : "SKOS",
        "it.uniroma2.art.owlart.models.SKOSXLModel" : "SKOS-XL"
    };
    
    private knownOntoMgrInterfaces = {
        "it.uniroma2.art.semanticturkey.ontology.sesame2.OntologyManagerFactorySesame2Impl" : "Sesame2"
    }
    
    // constructor() {}
    
    constructor(name?: string) {
        if (name != undefined) {
            this.name = name;       
        }
    }
    
    public setName(name: string) {
        this.name = name;
    }
    
    public getName(): string {
        return this.name;
    }
    
    public setAccessible(accessible: boolean) {
        this.accessible = accessible;
    }
    
    public isAccessible(): boolean {
        return this.accessible;
    }
    
    public setModelConfigType(modelConfigType: string) {
        this.modelConfigType = modelConfigType;
    }
    
    public getModelConfigType(): string {
        return this.modelConfigType;
    }
    
    public setOntoMgr(ontmgr: string) {
        this.ontmgr = ontmgr;
    }
    
    public getOntoMgr(): string {
        return this.ontmgr;
    }
    
    public getPrettyPrintOntoMgr(): string {
        var prettyPrint = null;
        prettyPrint = this.knownOntoMgrInterfaces[this.ontmgr];
        if (prettyPrint == null) {
            prettyPrint = this.ontmgr.substring(this.ontmgr.lastIndexOf("."));
        }
        return prettyPrint;
    }
    
    public setOntoType(ontoType: string) {
        this.ontoType = ontoType;
    }
    
    public getOntoType(): string {
        return this.ontoType;
    }
    
    public getPrettyPrintOntoType(): string {
        var prettyPrint = null;
        prettyPrint = this.knownRDFModelInterfaces[this.ontoType];
        if (prettyPrint == null) {
            prettyPrint = this.ontoType.substring(this.ontoType.lastIndexOf("."));
        }
        return prettyPrint;
    }
    
    public setOpen(open: boolean) {
        this.open = open;
    }
    
    public isOpen(): boolean {
        return this.open;
    }
    
    public setStatus(status: Object) {
        this.status = status;
    }
    
    public getStatus(): Object {
        return this.status;
    }
    
    public setType(type: string) {
        this.type = type;
    }
    
    public getType(): string {
        return this.type;
    }
}