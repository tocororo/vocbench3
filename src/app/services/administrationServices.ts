import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTURIResource } from '../models/ARTResources';
import { Project } from "../models/Project";
import { ProjectUserBinding, Role, User, UsersGroup } from "../models/User";
import { HttpManager, STRequestParams } from "../utils/HttpManager";

@Injectable()
export class AdministrationServices {

    private serviceName = "Administration";

    constructor(private httpMgr: HttpManager) { }

    // ADMINISTRATION CONFIGURATION SERVICES 

    /**
     * 
     * @param user 
     * @returns 
     */
    setAdministrator(user: User) {
        let params: STRequestParams = {
            email: user.getEmail(),
        };
        return this.httpMgr.doPost(this.serviceName, "setAdministrator", params);
    }

    /**
     * 
     * @param user 
     * @returns 
     */
    removeAdministrator(user: User) {
        let params: STRequestParams = {
            email: user.getEmail(),
        };
        return this.httpMgr.doPost(this.serviceName, "removeAdministrator", params);
    }

    /**
     * 
     * @param user 
     * @returns 
     */
    setSuperUser(user: User) {
        let params: STRequestParams = {
            email: user.getEmail(),
        };
        return this.httpMgr.doPost(this.serviceName, "setSuperUser", params);
    }

    /**
     * 
     * @param user 
     * @returns 
     */
    removeSuperUser(user: User) {
        let params: STRequestParams = {
            email: user.getEmail(),
        };
        return this.httpMgr.doPost(this.serviceName, "removeSuperUser", params);
    }

    /**
     * 
     * @param mailTo 
     */
    testEmailConfig(mailTo: string) {
        let params: STRequestParams = {
            mailTo: mailTo
        };
        return this.httpMgr.doGet(this.serviceName, "testEmailConfig", params);
    }


    //PROJECT-USER BINDING SERVICES

    /**
     * Adds a role to a user in a project
     * @param projectName
     * @param email
     * @param role
     */
    getProjectUserBinding(project: Project, email: string): Observable<ProjectUserBinding> {
        let params: STRequestParams = {
            projectName: project.getName(),
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
    addRolesToUser(project: Project, email: string, roles: string[]) {
        let params: STRequestParams = {
            projectName: project.getName(),
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
    removeRoleFromUser(project: Project, email: string, role: string) {
        let params: STRequestParams = {
            projectName: project.getName(),
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
    removeUserFromProject(project: Project, email: string) {
        let params: STRequestParams = {
            projectName: project.getName(),
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
    updateLanguagesOfUserInProject(project: Project, email: string, languages: string[]) {
        let params: STRequestParams = {
            projectName: project.getName(),
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
        let params: STRequestParams = {};
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
        let params: STRequestParams = {
            roleName: roleName
        };
        return this.httpMgr.doPost(this.serviceName, "createRole", params);
    }

    /**
     * Clones a role
     * @param roleName
     */
    cloneRole(sourceRoleName: string, targetRoleName: string) {
        let params: STRequestParams = {
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
        let params: STRequestParams = {
            roleName: roleName
        };
        return this.httpMgr.doPost(this.serviceName, "deleteRole", params);
    }

    /**
     * Exports the role with the given name
     * @param roleName 
     */
    exportRole(roleName: string) {
        let params: STRequestParams = {
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
        let data: STRequestParams = {
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
        let params: STRequestParams = {
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
        let params: STRequestParams = {
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
        let params: STRequestParams = {
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
        let params: STRequestParams = {
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
    clonePUBinding(sourceUserIri: ARTURIResource, sourceProject: Project, targetUserIri: ARTURIResource, targetProject: Project) {
        let params: STRequestParams = {
            sourceUserIri: sourceUserIri,
            sourceProjectName: sourceProject.getName(),
            targetUserIri: targetUserIri,
            targetProjectName: targetProject.getName()
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
        let params = {
            path: path
        };
        return this.httpMgr.doPost(this.serviceName, "setDataDir", params);
    }

    setPreloadProfilerThreshold(threshold: string) {
        let params = {
            threshold: threshold
        };
        return this.httpMgr.doPost(this.serviceName, "setPreloadProfilerThreshold", params);
    }


}