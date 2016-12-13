import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpManager} from "../utils/HttpManager";
import {ProjectUserBinding, Role} from "../utils/User";

@Injectable()
export class AdministrationServices {

    private serviceName = "Administration";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    //PROJECT-USER BINDING SERVICES

    /**
     * Adds a role to a user in a project
     * @param projectName
     * @param email
     * @param role
     */
    getProjectUserBinding(projectName: string, email: string): Observable<ProjectUserBinding> {
        console.log("[AdministrationServices] getProjectUserBinding");
        var params: any = {
            projectName: projectName,
            email: email
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectUserBinding", params, this.oldTypeService, true).map(
            stResp => {
                return new ProjectUserBinding(stResp.binding.projectName, stResp.binding.userEmail, stResp.binding.roles);
            }
        );
    }

    /**
     * Assigns a user to a project with the given roles, so creates a new binding
     * @param projectName
     * @param email
     * @param roles
     */
    addProjectUserBinding(projectName: string, email: string, roles: string[]) {
        console.log(roles.length);
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
            role: role
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
            role: role
        };
        return this.httpMgr.doGet(this.serviceName, "removeRoleToUserInProject", params, this.oldTypeService, true);
    }

    //ROLES

    /**
     * Returns all the available roles
     */
    listRoles(): Observable<Role[]> {
        console.log("[AdministrationServices] listRoles");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listRoles", params, this.oldTypeService, true).map(
            stResp => {
                var roles: Role[] = [];
                var roleList: any[] = stResp.roles;
                for (var i = 0; i < roleList.length; i++) {
                    var role = new Role(roleList[i].name);
                    var capabilityList: any[] = roleList[i].capabilities;
                    for (var j = 0; j < capabilityList.length; j++) {
                        role.addCapability(capabilityList[j]);
                    }
                    roles.push(role);
                }
                return roles;
            }
        );
    }

    /**
     * Creates a role with the given name
     * @param roleName
     */
    createRole(roleName: string) {
        console.log("[AdministrationServices] createRole");
        var params: any = {
            roleName: roleName
        };
        return this.httpMgr.doGet(this.serviceName, "createRole", params, this.oldTypeService, true);
    }

    /**
     * Deletes the role with the given name
     * @param roleName
     */
    deleteRole(roleName: string) {
        console.log("[AdministrationServices] deleteRole");
        var params: any = {
            roleName: roleName
        };
        return this.httpMgr.doGet(this.serviceName, "deleteRole", params, this.oldTypeService, true);
    }

    /**
     * Returns all the available capabilities
     */
    listCapabilities(): Observable<string[]> {
        console.log("[AdministrationServices] listCapabilities");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listCapabilities", params, this.oldTypeService, true).map(
            stResp => {
                var capabilities: string[] = [];
                var capabilityList: any[] = stResp.capabilities;
                for (var i = 0; i < capabilityList.length; i++) {
                    capabilities.push(capabilityList[i]);
                }
                console.log(JSON.stringify(capabilities));
                return capabilities;
            }
        );
    }

    /**
     * Adds a capability to the given role
     * @param role name of the role
     * @param capability
     */
    addCapabilityToRole(role: string, capability: string) {
        console.log("[AdministrationServices] addCapabilityToRole");
        var params: any = {
            role: role,
            capability: capability
        };
        return this.httpMgr.doGet(this.serviceName, "addCapabilityToRole", params, this.oldTypeService, true);
    }

    /**
     * Removes a capability from the given role
     * @param role name of the role
     * @param capability
     */
    removeCapabilityFromRole(role: string, capability: string) {
        console.log("[AdministrationServices] removeCapabilityFromRole");
        var params: any = {
            role: role,
            capability: capability
        };
        return this.httpMgr.doGet(this.serviceName, "removeCapabilityFromRole", params, this.oldTypeService, true);
    }

}