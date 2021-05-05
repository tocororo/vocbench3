import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTURIResource } from '../models/ARTResources';
import { Project } from "../models/Project";
import { ProjectUserBinding, Role, UsersGroup } from "../models/User";
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class AdministrationServices {

    private serviceName = "Administration";

    constructor(private httpMgr: HttpManager) { }

    // ADMINISTRATION CONFIGURATION SERVICES 

    /**
     * 
     * @param email 
     */
    setAdministrator(email: string) {
        let params: any = {
            email: email,
        }
        return this.httpMgr.doPost(this.serviceName, "setAdministrator", params);
    }

    /**
     * 
     * @param email 
     */
    removeAdministrator(email: string) {
        let params: any = {
            email: email,
        }
        return this.httpMgr.doPost(this.serviceName, "removeAdministrator", params);
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
        let params: any = {
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
        let params: any = {
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
        let params: any = {
            projectName: projectName,
            email: email
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectUserBinding", params).pipe(
            map(stResp => {
                let group: UsersGroup;
                if (stResp.group != null) {
                    group = UsersGroup.deserialize(stResp.group);
                }
                return new ProjectUserBinding(stResp.projectName, stResp.userEmail, stResp.roles, group, stResp.groupLimitations, stResp.languages);
            })
        );
    }

    /**
     * Assigns roles to a user in a project
     * @param projectName
     * @param email
     * @param roles
     */
    addRolesToUser(projectName: string, email: string, roles: string[]) {
        let params: any = {
            projectName: projectName,
            email: email,
            roles: roles
        };
        return this.httpMgr.doPost(this.serviceName, "addRolesToUser", params);
    }

    /**
     * Removes a role to a user in a project
     * @param projectName
     * @param email
     * @param role
     */
    removeRoleFromUser(projectName: string, email: string, role: string) {
        let params: any = {
            projectName: projectName,
            email: email,
            role: role
        };
        return this.httpMgr.doPost(this.serviceName, "removeRoleFromUser", params);
    }

    /**
     * Removes user from a project
     * @param projectName
     * @param email
     * @param role
     */
    removeUserFromProject(projectName: string, email: string) {
        let params: any = {
            projectName: projectName,
            email: email
        };
        return this.httpMgr.doPost(this.serviceName, "removeUserFromProject", params);
    }

    /**
     * Update a languages of a user in a project
     * @param projectName
     * @param email
     * @param language
     */
    updateLanguagesOfUserInProject(projectName: string, email: string, languages: string[]) {
        let params: any = {
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
        let params: any = {};
        if (project != null) {
            params.projectName = project.getName();
        }
        return this.httpMgr.doGet(this.serviceName, "listRoles", params).pipe(
            map(stResp => {
                let roles: Role[] = [];
                for (let i = 0; i < stResp.length; i++) {
                    let roleJson = stResp[i];
                    let role = new Role(roleJson.name, roleJson.level);
                    roles.push(role);
                }
                roles.sort((r1: Role, r2: Role) => r1.getName().localeCompare(r2.getName()));
                return roles;
            })
        );
    }

    /**
     * Creates a role with the given name
     * @param roleName
     */
    createRole(roleName: string) {
        let params: any = {
            roleName: roleName
        };
        return this.httpMgr.doPost(this.serviceName, "createRole", params);
    }

    /**
     * Clones a role
     * @param roleName
     */
    cloneRole(sourceRoleName: string, targetRoleName: string) {
        let params: any = {
            sourceRoleName: sourceRoleName,
            targetRoleName: targetRoleName
        };
        return this.httpMgr.doPost(this.serviceName, "cloneRole", params);
    }

    /**
     * Deletes the role with the given name
     * @param roleName
     */
    deleteRole(roleName: string) {
        let params: any = {
            roleName: roleName
        };
        return this.httpMgr.doPost(this.serviceName, "deleteRole", params);
    }

    /**
     * Exports the role with the given name
     * @param roleName 
     */
    exportRole(roleName: string) {
        let params: any = {
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
        let data: any = {
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
        let params: any = {
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
        let params: any = {
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
        let params: any = {
            role: role,
            capability: capability
        };
        return this.httpMgr.doPost(this.serviceName, "removeCapabilityFromRole", params);
    }

    /**
     * Removes a capability from the given role
     * @param role name of the role
     * @param capability
     */
    updateCapabilityForRole(role: string, oldCapability: string, newCapability: string) {
        let params: any = {
            role: role,
            oldCapability: oldCapability,
            newCapability: newCapability
        };
        return this.httpMgr.doPost(this.serviceName, "updateCapabilityForRole", params);
    }

    /**
     * 
     * @param sourceUserIri 
     * @param sourceProjectName 
     * @param targetUserIri 
     * @param targetProjectName 
     */
    clonePUBinding(sourceUserIri: ARTURIResource, sourceProjectName: string, targetUserIri: ARTURIResource, targetProjectName: string) {
        let params: any = {
            sourceUserIri: sourceUserIri,
            sourceProjectName: sourceProjectName,
            targetUserIri: targetUserIri,
            targetProjectName: targetProjectName
        };
        return this.httpMgr.doPost(this.serviceName, "clonePUBinding", params);
    }

    downloadPrivacyStatement() {
        return this.httpMgr.downloadFile(this.serviceName, "downloadPrivacyStatement", {}).pipe(
            map(blob => {
                let downloadUrl = window.URL.createObjectURL(blob);
                let downloadLink = document.createElement('a');
                downloadLink.href = downloadUrl;
                downloadLink.download = "privacy_statement.pdf";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                downloadLink.remove();
            })
        );
    }

    /**
     * Gets the data dir path
     */
     getDataDir() {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getDataDir", params);
    }

    setDataDir(path: string): Observable<string> {
        let params: any = {
            path: path
        };
        return this.httpMgr.doPost(this.serviceName, "setDataDir", params);
    }

    setPreloadProfilerThreshold(threshold: number) {
        let params: any = {
            threshold: threshold
        };
        return this.httpMgr.doPost(this.serviceName, "setPreloadProfilerThreshold", params);
    }


}