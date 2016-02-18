import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class ProjectServices {

    private serviceName = "Projects";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    listProjects() {
        console.log("[ProjectServices] listProjects");
        var params = {
            consumer: "SYSTEM"
        };
        return this.httpMgr.doGet(this.serviceName, "listProjects", params, this.oldTypeService);
    }

    disconnectFromProject(project: string) {
        console.log("[ProjectServices] disconnectFromProject");
        var params = {
            consumer: "SYSTEM",
            projectName: project
        };
        return this.httpMgr.doGet(this.serviceName, "disconnectFromProject", params, this.oldTypeService);
    }

    accessProject(project: string) {
        console.log("[ProjectServices] accessProject");
        var params = {
            consumer: "SYSTEM",
            projectName: project,
            requestedAccessLevel: "RW",
            requestedLockLevel: "NO"
        };
        return this.httpMgr.doGet(this.serviceName, "accessProject", params, this.oldTypeService);
    }

    deleteProject(project: string) {
        console.log("[ProjectServices] deleteProject");
        var params = {
            consumer: "SYSTEM",
            projectName: project,
        };
        return this.httpMgr.doGet(this.serviceName, "deleteProject", params, this.oldTypeService);
    }

}