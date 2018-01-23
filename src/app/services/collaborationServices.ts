import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { ARTURIResource } from '../models/ARTResources';
import { PluginConfiguration, PluginConfigProp } from '../models/Plugins';

@Injectable()
export class CollaborationServices {

    private serviceName = "Collaboration";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Gets the settings to be set to the collaboration backend (mainly the serverURL)
     * @param backendId
     */
    getProjectSettings(backendId: string): Observable<PluginConfiguration> {
        console.log("[CollaborationServices] getProjectSettings");
        var params: any = {
            backendId: backendId,
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectSettings", params, true).map(
            stResp => {
                return PluginConfiguration.parse(stResp);
            }
        );
    }

    /**
     * Gets the preferences to be set to the collaboration backend (likely username and password)
     * @param backendId
     */
    getProjectPreferences(backendId: string): Observable<PluginConfiguration> {
        console.log("[CollaborationServices] getProjectPreferences");
        var params: any = {
            backendId: backendId,
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectPreferences", params, true).map(
            stResp => {
                return PluginConfiguration.parse(stResp);
            }
        );
    }

    /**
     * Activate the collaboration system on the current project
     * @param backendId 
     * @param projectSettings 
     * @param currentUserPreferences 
     */
    activateCollaboratioOnProject(backendId: string, projectSettings: any, currentUserPreferences: any) {
        console.log("[CollaborationServices] activateCollaboratioOnProject");
        var params: any = {
            backendId: backendId,
            projectSettings: JSON.stringify(projectSettings),
            currentUserPreferences: JSON.stringify(currentUserPreferences)
        };
        return this.httpMgr.doPost(this.serviceName, "activateCollaboratioOnProject", params, true);
    }

    addPreferenceiesForCurrentUser(backendId: string, currentUserPreferences: any) {
        console.log("[CollaborationServices] addPreferenceiesForCurrentUser");
        var params: any = {
            backendId: backendId,
            currentUserPreferences: JSON.stringify(currentUserPreferences)
        };
        return this.httpMgr.doPost(this.serviceName, "addPreferenceiesForCurrentUser", params, true);
    }

    createIssue(resource: ARTURIResource, summary: string) {
        console.log("[CollaborationServices] createIssue");
        var params: any = {
            resource: resource,
            summary: summary
        };
        return this.httpMgr.doPost(this.serviceName, "createIssue", params, true);
    }

    assignProject(projectName: string, projectKey: string, projectId?: string) {
        console.log("[CollaborationServices] assignProject");
        var params: any = {
            projectName: projectName,
            projectKey: projectKey,
        };
        if (projectId != undefined) {
            params.projectId = projectId;
        }
        return this.httpMgr.doPost(this.serviceName, "assignProject", params, true);
    }

    createProject(projectName: string, projectKey: string) {
        console.log("[CollaborationServices] createProject");
        var params: any = {
            projectName: projectName,
            projectKey: projectKey
        };
        return this.httpMgr.doPost(this.serviceName, "createProject", params, true);
    }

    assignResourceToIssue(issue: string, resource: ARTURIResource) {
        console.log("[CollaborationServices] assignResourceToIssue");
        var params: any = {
            issue: issue,
            resource: resource
        };
        return this.httpMgr.doPost(this.serviceName, "assignResourceToIssue", params, true);
    }

    listIssuesAssignedToResource(resource: ARTURIResource) {
        console.log("[CollaborationServices] listIssuesAssignedToResource");
        var params: any = {
            resource: resource
        };
        return this.httpMgr.doGet(this.serviceName, "listIssuesAssignedToResource", params, true);
    }

    listProjects(): Observable<{ id: string, key: string, name: string }[]> {
        console.log("[CollaborationServices] listProjects");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listProjects", params, true);
    }

    listIssues() {
        console.log("[CollaborationServices] listIssues");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listIssues", params, true);
    }

}