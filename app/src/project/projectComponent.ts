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
    
	constructor(private projectService:ProjectServices, private vbCtx:VocbenchCtx) {}
    
    ngOnInit() {
        this.projectService.listProjects()
            .subscribe(
                stResp => {
				    var projColl = stResp.getElementsByTagName("project");
                    var projects = [];
				    for (var i=0; i<projColl.length; i++) {
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
                },
                err => console.log(err)
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
    
    private prettyPrintOntoMgr(ontomgr:string): string {
        var prettyPrint = null;
        var knownOntoMgrInterfaces = new Array();
        knownOntoMgrInterfaces["it.uniroma2.art.semanticturkey.ontology.sesame2.OntologyManagerFactorySesame2Impl"] = "Sesame2";
        prettyPrint = knownOntoMgrInterfaces[ontomgr];
        if (prettyPrint == null) {
            prettyPrint = ontomgr.substring(ontomgr.lastIndexOf("."));
        }
        return prettyPrint;
    }
    
    public onProjectDblClick(project) {
        var currentProject;
        var currentProjectName = this.vbCtx.getProject();
        if (currentProjectName == "SYSTEM") {
            currentProject = new Object();
            currentProject.name = currentProjectName;
        } else {
            for (var i=0; i<this.projectList.length; i++) {
                if (this.projectList[i].name == currentProjectName) {
                    currentProject = this.projectList[i];
                    break;
                }
            }
        }    
        if (currentProject.name == "SYSTEM") {
            if (project.open) {
                //closing a project open when VB started => disconnect
                this.disconnectFromProject(project);
            } else {
                //opening a first project => connect
                this.connectToProject(project);    
            }
        } else {
            if (currentProject.name == project.name) {
                //closing project => just disconnect
                this.disconnectFromProject(project);
            } else {
                //changing project => disconnect and then connect
                this.disconnectFromProject(currentProject);
                this.connectToProject(project)
            }
            
        }
    }
    
    private connectToProject(project) {
        this.projectService.accessProject(project.name)
            .subscribe(
                data => {
                    this.vbCtx.setProject(project.name);
                    project.open = true;
                },
                err => console.log(err)
            );
    }
    
    private disconnectFromProject(project) {
        this.projectService.disconnectFromProject(project.name)
            .subscribe(
                stResp => {
                    project.open = false;
                } 
            );
    }
    
}