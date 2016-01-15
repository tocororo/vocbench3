import {Component, OnInit, OnDestroy} from "angular2/core";
import {ProjectServices} from "../services/projectServices";
import {VocbenchCtx} from '../utils/VocbenchCtx';

@Component({
	selector: "project-component",
	templateUrl: "app/src/project/projectComponent.html",
    providers: [ProjectServices],
})
export class ProjectComponent implements OnInit {
	public currentProject;
    public projectList;
    
	constructor(private projectService:ProjectServices, private vbCtx:VocbenchCtx) {}
    
    ngOnInit() {
        this.projectService.listProjects()
            .subscribe(
                stResp => {
				    var projColl = stResp.getElementsByTagName("project");
                    var projects = [];
				    for (var i=0; i<projColl.length; i++) {
                        projects.push({
                            accessible: projColl[i].getAttribute("accessible"),
                            modelConfigType: projColl[i].getAttribute("modelConfigType"),
                            ontmgr: projColl[i].getAttribute("ontmgr"),
                            ontoType: projColl[i].getAttribute("ontoType"),
                            open: projColl[i].getAttribute("open"),
                            status: projColl[i].getAttribute("status"),
                            type: projColl[i].getAttribute("type"),
				            name: projColl[i].textContent,
					   })
				    }
                    this.projectList = projects;
                },
                err => console.log(err),
                () => {}
            );
        this.currentProject = this.vbCtx.getProject();
    }
    
    onChange(newProject) {
        console.log("new Project " + JSON.stringify(newProject));
        if (newProject != this.currentProject) {
            //disonnect from old project
            if (this.currentProject != "SYSTEM") {
                this.projectService.disconnectFromProject(this.currentProject)
            }
            //access the new one
            this.projectService.accessProject(newProject)
                .subscribe(
                data => {
                    this.currentProject = newProject;
                    this.vbCtx.setProject(newProject);
                },
                err => console.log(err),
                () => { }
            );
        }
    }
    
}