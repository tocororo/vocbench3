import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";
import {Project} from '../utils/Project';

@Injectable()
export class ProjectServices {

    private serviceName = "Projects";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Gets the current available projects in ST
     * @return an array of Project
     */
    listProjects() {
        console.log("[ProjectServices] listProjects");
        var params = {
            consumer: "SYSTEM"
        };
        return this.httpMgr.doGet(this.serviceName, "listProjects", params, this.oldTypeService).map(
            stResp => {
                var projColl = stResp.getElementsByTagName("project");
                var projectList = [];
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
                    projectList.push(proj);
                }
                return projectList;
            }
        );
    }

    /**
     * Disconnects from the given project
     * @param project the project to disconnect
     */
    disconnectFromProject(project: Project) {
        console.log("[ProjectServices] disconnectFromProject");
        var params = {
            consumer: "SYSTEM",
            projectName: project.getName()
        };
        return this.httpMgr.doGet(this.serviceName, "disconnectFromProject", params, this.oldTypeService);
    }
    
    /**
     * Accesses to the given project
     * @param project the project to access
     */
    accessProject(project: Project) {
        console.log("[ProjectServices] accessProject");
        var params = {
            consumer: "SYSTEM",
            projectName: project.getName(),
            requestedAccessLevel: "RW",
            requestedLockLevel: "NO"
        };
        return this.httpMgr.doGet(this.serviceName, "accessProject", params, this.oldTypeService);
    }

    /**
     * Deletes the given project
     * @param project the project to delete
     */
    deleteProject(project: Project) {
        console.log("[ProjectServices] deleteProject");
        var params = {
            consumer: "SYSTEM",
            projectName: project.getName(),
        };
        return this.httpMgr.doGet(this.serviceName, "deleteProject", params, this.oldTypeService);
    }
    
    /**
     * Exports the given project in a zip file
     * @param project the project to export
     */
    exportProject(project: Project) {
        console.log("[ProjectServices] exportProject");
        var params = {
            projectName: project.getName()
        };
        return this.httpMgr.downloadFile(this.serviceName, "exportProject", params, this.oldTypeService);
    }

}