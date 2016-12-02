import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class AdministrationServices {

    private serviceName = "Administration";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Adds a role to a user in a project
     * @param projectName
     * @param email
     * @param role
     */
    getProjectUserBinding(projectName: string, email: string) {
        console.log("[AdministrationServices] getProjectUserBinding");
        var params: any = {
            projectName: projectName,
            email: email
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectUserBinding", params, this.oldTypeService, true);
    }

    /**
     * Assigns a user to a project with the given roles, so creates a new binding
     * @param projectName
     * @param email
     * @param roles
     */
    addProjectUserBinding(projectName: string, email: string, roles: string[]) {
        console.log("[AdministrationServices] addProjectUserBinding");
        var params: any = {
            projectName: projectName,
            email: email,
            roles: roles
        };
        return this.httpMgr.doGet(this.serviceName, "addProjectUserBinding", params, this.oldTypeService, true);
    }

    /**
     * Adds a role to a user in a project
     * @param projectName
     * @param email
     * @param role
     */
    addRoleToUserInProject(projectName: string, email: string, role: string) {
        console.log("[AdministrationServices] addRoleToUserInProject");
        var params: any = {
            projectName: projectName,
            email: email,
            roles: role
        };
        return this.httpMgr.doGet(this.serviceName, "addRoleToUserInProject", params, this.oldTypeService, true);
    }

    /**
     * Removes a role to a user in a project
     * @param projectName
     * @param email
     * @param role
     */
    removeRoleToUserInProject(projectName: string, email: string, role: string) {
        console.log("[AdministrationServices] removeRoleToUserInProject");
        var params: any = {
            projectName: projectName,
            email: email,
            roles: role
        };
        return this.httpMgr.doGet(this.serviceName, "removeRoleToUserInProject", params, this.oldTypeService, true);
    }

}