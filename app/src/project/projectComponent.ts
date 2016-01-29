import {Component, OnInit, OnDestroy} from "angular2/core";
import {ProjectServices} from "../services/projectServices";
import {VocbenchCtx} from '../utils/VocbenchCtx';

@Component({
    selector: "project-component",
    templateUrl: "app/src/project/projectComponent.html",
    providers: [ProjectServices],
})
export class ProjectComponent implements OnInit {
    public projectList;

    public selectedProject;

    constructor(private projectService: ProjectServices, private vbCtx: VocbenchCtx) { }

    ngOnInit() {
        this.projectService.listProjects()
            .subscribe(
            stResp => {
                var projColl = stResp.getElementsByTagName("project");
                var projects = [];
                for (var i = 0; i < projColl.length; i++) {
                    var proj: any = new Object();
                    proj.accessible = projColl[i].getAttribute("accessible");
                    proj.modelConfigType = projColl[i].getAttribute("modelConfigType");
                    proj.ontmgr = this.prettyPrintOntoMgr(projColl[i].getAttribute("ontmgr"));
                    proj.ontoType = this.prettyPrintOntoType(projColl[i].getAttribute("ontoType"));
                    proj.open = (projColl[i].getAttribute("open") == "true");
                    var status: any = new Object();
                    var hasIssues = projColl[i].getAttribute("status") != "ok";
                    if (hasIssues) {
                        status.class = "glyphicon glyphicon-exclamation-sign";
                        status.message = projColl[i].getAttribute("stMsg");
                    } else {
                        status.class = "glyphicon glyphicon-ok-circle";
                        status.message = projColl[i].getAttribute("status");
                    }
                    proj.status = status;
                    proj.type = projColl[i].getAttribute("type");
                    proj.name = projColl[i].textContent;
                    projects.push(proj);
                }
                this.projectList = projects;
                    
                //Init closing potential multiple open projects. If just one, connect to it.
                var currentProject = this.vbCtx.getProject();
                var openProjectList = [];
                if (currentProject.name == "SYSTEM") { //first start
                    for (var i = 0; i < this.projectList.length; i++) { //collect projects remained open
                        if (this.projectList[i].open) {
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
            }
            );
    }

    public selectProject(project) {
        this.selectedProject = project;
    }

    public isSelected(project) {
        return this.selectedProject == project;
    }
    
    //TODO
    public createProject() {
        alert("create project");
    }

    public deleteProject() {
        if (this.selectedProject.open) {
            alert(this.selectedProject.name + " is currently open. Please, close the project and then retry.");
            return;
        } else {
            this.projectService.deleteProject(this.selectedProject.name)
                .subscribe(
                stResp => {
                    for (var i = 0; i < this.projectList.length; i++) { //remove project from list
                        if (this.projectList[i].name == this.selectedProject.name) {
                            this.projectList.splice(i, 1);
                        }
                    }
                    this.selectedProject = null;
                },
                err => {
                    alert("Error: " + err);
                    console.error(err.stack);
                }
        }
    }
    
    //TODO
    public importProject() {
        alert("import project");
    }

    public openProject(project) {
        var currentProject = this.vbCtx.getProject();
        if (currentProject.name != "SYSTEM") {
            this.disconnectFromProject(currentProject);
        }
        this.connectToProject(project);
    }

    public closeProject(project) {
        this.disconnectFromProject(project);
    }

    private connectToProject(project) {
        this.projectService.accessProject(project.name)
            .subscribe(
            stResp => {
                this.vbCtx.setProject(project);
                project.open = true;
            },
            err => {
                alert("Error: " + err);
                console.error(err.stack);
            }
            );
    }

    private disconnectFromProject(project) {
        this.projectService.disconnectFromProject(project.name)
            .subscribe(
            stResp => {
                this.vbCtx.setProject({ name: "SYSTEM" });
                project.open = false;
            },
            err => {
                alert("Error: " + err);
                console.error(err.stack);
            }
            );
    }

    private prettyPrintOntoType(ontoType: string): string {
        var prettyPrint = null;
        var knownRDFModelInterfaces = new Array();
        knownRDFModelInterfaces["it.uniroma2.art.owlart.models.RDFModel"] = "RDF";
        knownRDFModelInterfaces["it.uniroma2.art.owlart.models.RDFSModel"] = "RDFS";
        knownRDFModelInterfaces["it.uniroma2.art.owlart.models.OWLModel"] = "OWL";
        knownRDFModelInterfaces["it.uniroma2.art.owlart.models.SKOSModel"] = "SKOS";
        knownRDFModelInterfaces["it.uniroma2.art.owlart.models.SKOSXLModel"] = "SKOS-XL";
        prettyPrint = knownRDFModelInterfaces[ontoType];
        if (prettyPrint == null) {
            prettyPrint = ontoType.substring(ontoType.lastIndexOf("."));
        }
        return prettyPrint;
    }

    private prettyPrintOntoMgr(ontomgr: string): string {
        var prettyPrint = null;
        var knownOntoMgrInterfaces = new Array();
        knownOntoMgrInterfaces["it.uniroma2.art.semanticturkey.ontology.sesame2.OntologyManagerFactorySesame2Impl"] = "Sesame2";
        prettyPrint = knownOntoMgrInterfaces[ontomgr];
        if (prettyPrint == null) {
            prettyPrint = ontomgr.substring(ontomgr.lastIndexOf("."));
        }
        return prettyPrint;
    }
}