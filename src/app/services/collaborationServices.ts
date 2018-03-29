import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { ARTURIResource } from '../models/ARTResources';
import { Settings, SettingsProp } from '../models/Plugins';
import { Issue, CollaborationUtils } from '../models/Collaboration';

@Injectable()
export class CollaborationServices {

    private serviceName = "Collaboration";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns an object containing the following boolean values:
     * enabled
     * settingsConfigured
     * preferencesConfigured
     */
    getCollaborationSystemStatus(): 
        Observable<{ backendId: string, enabled: boolean, linked: boolean, settingsConfigured: boolean, preferencesConfigured: boolean }> {
        console.log("[CollaborationServices] getCollaborationSystemStatus");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getCollaborationSystemStatus", params);
    }

    /**
     * Gets the settings to be set to the collaboration backend (mainly the serverURL)
     * @param backendId
     */
    getProjectSettings(backendId: string): Observable<Settings> {
        console.log("[CollaborationServices] getProjectSettings");
        var params: any = {
            backendId: backendId,
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectSettings", params).map(
            stResp => {
                return Settings.parse(stResp);
            }
        );
    }

    /**
     * Gets the preferences to be set to the collaboration backend (likely username and password)
     * @param backendId
     */
    getProjectPreferences(backendId: string): Observable<Settings> {
        console.log("[CollaborationServices] getProjectPreferences");
        var params: any = {
            backendId: backendId,
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectPreferences", params).map(
            stResp => {
                return Settings.parse(stResp);
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
        return this.httpMgr.doPost(this.serviceName, "activateCollaboratioOnProject", params);
    }

    addPreferencesForCurrentUser(backendId: string, currentUserPreferences: any) {
        console.log("[CollaborationServices] addPreferencesForCurrentUser");
        var params: any = {
            backendId: backendId,
            currentUserPreferences: JSON.stringify(currentUserPreferences)
        };
        return this.httpMgr.doPost(this.serviceName, "addPreferencesForCurrentUser", params);
    }

    createIssue(resource: ARTURIResource, summary: string) {
        console.log("[CollaborationServices] createIssue");
        var params: any = {
            resource: resource,
            summary: summary
        };
        return this.httpMgr.doPost(this.serviceName, "createIssue", params);
    }

    assignProject(projectName: string, projectKey: string, projectId: string) {
        console.log("[CollaborationServices] assignProject");
        var params: any = {
            projectName: projectName,
            projectKey: projectKey,
            projectId: projectId
        };
        return this.httpMgr.doPost(this.serviceName, "assignProject", params);
    }

    createProject(projectName: string, projectKey: string) {
        console.log("[CollaborationServices] createProject");
        var params: any = {
            projectName: projectName,
            projectKey: projectKey
        };
        return this.httpMgr.doPost(this.serviceName, "createProject", params);
    }

    assignResourceToIssue(issue: string, resource: ARTURIResource) {
        console.log("[CollaborationServices] assignResourceToIssue");
        var params: any = {
            issue: issue,
            resource: resource
        };
        return this.httpMgr.doPost(this.serviceName, "assignResourceToIssue", params);
    }

    listIssuesAssignedToResource(resource: ARTURIResource): Observable<Issue[]> {
        console.log("[CollaborationServices] listIssuesAssignedToResource");
        var params: any = {
            resource: resource
        };
        var options: VBRequestOptions = new VBRequestOptions({
            errorAlertOpt: { 
                show: true, 
                exceptionsToSkip: ['java.net.ConnectException'] 
            } 
        });
        return this.httpMgr.doGet(this.serviceName, "listIssuesAssignedToResource", params, options).map(
            resp => {
                let issues: Issue[] = CollaborationUtils.parseIssues(resp);
                CollaborationUtils.sortIssues(issues, "key");
                return issues;
            }
        );
    }

    listProjects(): Observable<{ id: string, key: string, name: string }[]> {
        console.log("[CollaborationServices] listProjects");
        var params: any = {};
        var options: VBRequestOptions = new VBRequestOptions({
            errorAlertOpt: { 
                show: true, 
                exceptionsToSkip: ['java.net.ConnectException'] 
            } 
        });
        return this.httpMgr.doGet(this.serviceName, "listProjects", params, options);
    }

    listIssues(): Observable<Issue[]> {
        console.log("[CollaborationServices] listIssues");
        var params: any = {};
        var options: VBRequestOptions = new VBRequestOptions({
            errorAlertOpt: { 
                show: true, 
                exceptionsToSkip: ['java.net.ConnectException'] 
            } 
        });
        return this.httpMgr.doGet(this.serviceName, "listIssues", params, options).map(
            resp => {
                let issues: Issue[] = CollaborationUtils.parseIssues(resp);
                CollaborationUtils.sortIssues(issues, "key");
                return issues;
            }
        );
    }

}