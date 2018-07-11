import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Project } from "../models/Project";
import { ProjectUserBinding, Role, UsersGroup } from "../models/User";
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class AdministrationServices {

    private serviceName = "Administration";

    constructor(private httpMgr: HttpManager) { }

    // ADMINISTRATION CONFIGURATION SERVICES 

    /**
     * Gets the administration config: a map with key value of configuration parameters
     */
    getAdministrationConfig() {
        console.log("[AdministrationServices] getAdministrationConfig");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getAdministrationConfig", params);
    }

    /**
     * 
     * @param adminEmailAddress 
     */
    updateAdministrator(adminEmailAddress: string) {
        console.log("[AdministrationServices] updateAdministrator");
        var params: any = {
            adminEmailAddress: adminEmailAddress,
        }
        return this.httpMgr.doPost(this.serviceName, "updateAdministrator", params);
    }

    /**
     * 
     * @param mailSmtpHost 
     * @param mailSmtpPort 
     * @param mailSmtpAuth 
     * @param mailFromAddress 
     * @param mailFromAlias 
     * @param mailFromPassword 
     */
    updateEmailConfig(mailSmtpHost: string, mailSmtpPort: string, mailSmtpAuth: string,
        mailFromAddress: string, mailFromAlias: string, mailFromPassword?: string) {
        console.log("[AdministrationServices] updateEmailConfig");
        var params: any = {
            mailSmtpHost: mailSmtpHost,
            mailSmtpPort: mailSmtpPort,
            mailSmtpAuth: mailSmtpAuth,
            mailFromAddress: mailFromAddress,
            mailFromAlias: mailFromAlias
        }
        if (mailFromPassword != null) {
            params.mailFromPassword = mailFromPassword
        }
        return this.httpMgr.doPost(this.serviceName, "updateEmailConfig", params);
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
        return this.httpMgr.doGet(this.serviceName, "getProjectUserBinding", params).map(
            stResp => {
                let group: UsersGroup;
                if (stResp.group != null) {
                    group = UsersGroup.deserialize(stResp.group);
                }
                return new ProjectUserBinding(stResp.projectName, stResp.userEmail, stResp.roles, group, stResp.groupLimitations, stResp.languages);
            }
        );
    }

    /**
     * Assigns roles to a user in a project
     * @param projectName
     * @param email
     * @param roles
     */
    addRolesToUser(projectName: string, email: string, roles: string[]) {
        console.log("[AdministrationServices] addRolesToUser");
        var params: any = {
            projectName: projectName,
            email: email,
            roles: roles
        };
        return this.httpMgr.doGet(this.serviceName, "addRolesToUser", params);
    }

    /**
     * Removes a role to a user in a project
     * @param projectName
     * @param email
     * @param role
     */
    removeRoleFromUser(projectName: string, email: string, role: string) {
        console.log("[AdministrationServices] removeRoleFromUser");
        var params: any = {
            projectName: projectName,
            email: email,
            role: role
        };
        return this.httpMgr.doGet(this.serviceName, "removeRoleFromUser", params);
    }

    /**
     * Removes a role to a user in a project
     * @param projectName
     * @param email
     * @param role
     */
    removeAllRolesFromUser(projectName: string, email: string) {
        console.log("[AdministrationServices] removeAllRolesFromUser");
        var params: any = {
            projectName: projectName,
            email: email
        };
        return this.httpMgr.doGet(this.serviceName, "removeAllRolesFromUser", params);
    }

    /**
     * Update a languages of a user in a project
     * @param projectName
     * @param email
     * @param language
     */
    updateLanguagesOfUserInProject(projectName: string, email: string, languages: string[]) {
        console.log("[AdministrationServices] updateLanguagesOfUserInProject");
        var params: any = {
            projectName: projectName,
            email: email,
            languages: languages
        };
        return this.httpMgr.doPost(this.serviceName, "updateLanguagesOfUserInProject", params);
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
        return this.httpMgr.doGet(this.serviceName, "listRoles", params).map(
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
        return this.httpMgr.doGet(this.serviceName, "createRole", params);
    }

    /**
     * Clones a role
     * @param roleName
     */
    cloneRole(sourceRoleName: string, targetRoleName: string) {
        console.log("[AdministrationServices] cloneRole");
        var params: any = {
            sourceRoleName: sourceRoleName,
            targetRoleName: targetRoleName
        };
        return this.httpMgr.doGet(this.serviceName, "cloneRole", params);
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
        return this.httpMgr.doGet(this.serviceName, "deleteRole", params);
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
        return this.httpMgr.downloadFile(this.serviceName, "exportRole", params);
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
        return this.httpMgr.uploadFile(this.serviceName, "importRole", data);
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
        return this.httpMgr.doGet(this.serviceName, "listCapabilities", params);
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
        return this.httpMgr.doPost(this.serviceName, "addCapabilityToRole", params);
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
        return this.httpMgr.doGet(this.serviceName, "removeCapabilityFromRole", params);
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
        return this.httpMgr.doPost(this.serviceName, "updateCapabilityForRole", params);
    }

}