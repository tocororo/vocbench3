import {Component} from "angular2/core";
import {RdfResourceComponent} from "../widget/rdfResource/rdfResourceComponent";
import {Http, HTTP_PROVIDERS} from 'angular2/http';
import {ProjectServices} from "./projectServices";
import 'rxjs/add/operator/map'; //CHECK IF THIS STILL BE NEEDED IN FUTURE VERSION

@Component({
	selector: "project-component",
	templateUrl: "app/src/project/projectComponent.html",
    viewProviders: [HTTP_PROVIDERS], //CHECK THIS
    providers: [ProjectServices],
	directives: [RdfResourceComponent]
})
export class ProjectComponent {
	public currentProject = "progetto attuale";
    public projectList = [];
    
	constructor(private projectService:ProjectServices) {
	
    }

	onClick() {
        this.projectService.listProjects()
            .subscribe(
                function(data) {
                    var parser = new DOMParser();
			        var stResp = parser.parseFromString(data, "application/xml"); 
				    var projColl = stResp.getElementsByTagName("project");
				    for (var i=0; i<projColl.length; i++) {
                        this.projectList.push({
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
                    console.log("projs: " + JSON.stringify(this.projectList));
                },
                function(err) { console.log("in error callback"); this.logError(err) },
                function() { console.log('Call Complete') }
            );
	}
    
}