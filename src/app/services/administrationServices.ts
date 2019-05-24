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
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getAdministrationConfig", params);
    }

    /**
     * 
     * @param adminEmailAddress 
     */
    updateAdministrator(adminEmailAddress: string) {
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
    updateEmailConfig(mailSmtpHost: string, mailSmtpPort: string, mailSmtpAuth: boolean, mailSmtpSsl: boolean, mailSmtpTls: boolean,
        mailFromAddress: string, mailFromAlias: string, mailFromPassword?: string) {
        var params: any = {
            mailSmtpHost: mailSmtpHost,
            mailSmtpPort: mailSmtpPort,
            mailSmtpAuth: mailSmtpAuth,
            mailSmtpSsl: mailSmtpSsl,
            mailSmtpTls: mailSmtpTls,
            mailFromAddress: mailFromAddress,
            mailFromAlias: mailFromAlias
        }
        if (mailFromPassword != null) {
            params.mailFromPassword = mailFromPassword
        }
        return this.httpMgr.doPost(this.serviceName, "updateEmailConfig", params);
    }

    /**
     * 
     * @param mailTo 
     */
    testEmailConfig(mailTo: string) {
        var params: any = {
            mailTo: mailTo
        }
        return this.httpMgr.doGet(this.serviceName, "testEmailConfig", params);
    }


    //PROJECT-USER BINDING SERVICES

    /**
     * Adds a role to a user in a project
     * @param projectName
     * @param email
     * @param role
     */
    getProjectUserBinding(projectName: string, email: string): Observable<ProjectUserBinding> {
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
        var params: any = {
            projectName: projectName,
            email: email,
            role: role
        };
        return this.httpMgr.doGet(this.serviceName, "removeRoleFromUser", params);
    }

    /**
     * Removes user from a project
     * @param projectName
     * @param email
     * @param role
     */
    removeUserFromProject(projectName: string, email: string) {
        var params: any = {
            projectName: projectName,
            email: email
        };
        return this.httpMgr.doGet(this.serviceName, "removeUserFromProject", params);
    }

    /**
     * Update a languages of a user in a project
     * @param projectName
     * @param email
     * @param language
     */
    updateLanguagesOfUserInProject(projectName: string, email: string, languages: string[]) {
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
        var params: any = {
            role: role,
            oldCapability: oldCapability,
            newCapability: newCapability
        };
        return this.httpMgr.doPost(this.serviceName, "updateCapabilityForRole", params);
    }

    downloadPrivacyStatement() {
        return this.httpMgr.downloadFile(this.serviceName, "downloadPrivacyStatement", {}).map(
            blob => {
                let downloadUrl = window.URL.createObjectURL(blob);
                let downloadLink = document.createElement('a');
                downloadLink.href = downloadUrl;
                downloadLink.download = "privacy_statement.pdf";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                downloadLink.remove();
            }
        );
    }
}