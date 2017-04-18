import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { ProjectUserBinding, Role } from "../models/User";
import { Project } from "../models/Project";

@Injectable()
export class AdministrationServices {

    private serviceName = "Administration";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    // ADMINISTRATION CONFIGURATION SERVICES 

    /**
     * Gets the administration config: a map with key value of configuration parameters
     */
    getAdministrationConfig() {
        console.log("[AdministrationServices] getAdministrationConfig");
        return this.httpMgr.doGet(this.serviceName, "getAdministrationConfig", null, this.oldTypeService, true);
    }

    /**
     * Updates the administration config parameters
	 * @param emailAdminAddress
	 * @param emailFromAddress
	 * @param emailFromPassword
	 * @param emailFromAlias
	 * @param emailFromHost
	 * @param emailFromPort
     */
    updateAdministrationConfig(emailAdminAddress: string, emailFromAddress: string, emailFromPassword: string,
        emailFromAlias: string, emailFromHost: string, emailFromPort: string) {
        console.log("[AdministrationServices] updateAdministrationConfig");
        var params: any = {
            emailAdminAddress: emailAdminAddress,
            emailFromAddress: emailFromAddress,
            emailFromPassword: emailFromPassword,
            emailFromAlias: emailFromAlias,
            emailFromHost: emailFromHost,
            emailFromPort: emailFromPort
        }
        return this.httpMgr.doPost(this.serviceName, "updateAdministrationConfig", params, this.oldTypeService, true);
    }


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
                return new ProjectUserBinding(stResp.projectName, stResp.userEmail, stResp.roles);
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
     * Returns all the available roles for the given project
     * @param projectName if not provided returns the roles at system level
     */
    listRoles(project?: Project): Observable<Role[]> {
        console.log("[AdministrationServices] listRoles");
        var params: any = {};
        if (project != null) {
            params.projectName = project.getName();
        }
        return this.httpMgr.doGet(this.serviceName, "listRoles", params, this.oldTypeService, true).map(
            stResp => {
                var roles: Role[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    let roleJson = stResp[i];
                    var role = new Role(roleJson.name, roleJson.level);
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
     * Exports the role with the given name
     * @param roleName 
     */
    exportRole(roleName: string) {
        console.log("[AdministrationServices] exportRole");
        var params: any = {
            roleName: roleName
        };
        return this.httpMgr.downloadFile(this.serviceName, "exportRole", params, this.oldTypeService);
    }

    /**
     * Imports a role
     * @param inputFile file of the role to import 
     * @param newRoleName name of the new role (Optional, if not provided the name will be inferred from the input file)
     */
    importRole(inputFile: File, newRoleName?: string) {
        console.log("[AdministrationServices] importCustomForm");
        var data: any = {
            inputFile: inputFile
        };
        if (newRoleName != null) {
            data.newRoleName = newRoleName;
        }
        return this.httpMgr.uploadFile(this.serviceName, "importRole", data, this.oldTypeService, true);
    }

    /**
     * Returns all the capabilities of the given role in the given project
     * @param projectName if not provided returns the roles at system level
     */
    listCapabilities(role: Role, project?: Project): Observable<string[]> {
        console.log("[AdministrationServices] listCapabilities");
        var params: any = {
            role: role.getName()
        };
        if (project != null) {
            params.projectName = project.getName();
        }
        return this.httpMgr.doGet(this.serviceName, "listCapabilities", params, this.oldTypeService, true);
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
        return this.httpMgr.doPost(this.serviceName, "addCapabilityToRole", params, this.oldTypeService, true);
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

    /**
     * Removes a capability from the given role
     * @param role name of the role
     * @param capability
     */
    updateCapabilityForRole(role: string, oldCapability: string, newCapability: string) {
        console.log("[AdministrationServices] updateCapabilityForRole");
        var params: any = {
            role: role,
            oldCapability: oldCapability,
            newCapability: newCapability
        };
        return this.httpMgr.doPost(this.serviceName, "updateCapabilityForRole", params, this.oldTypeService, true);
    }

}