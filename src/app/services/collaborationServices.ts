import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTURIResource } from '../models/ARTResources';
import { CollaborationUtils, Issue, IssuesStruct } from '../models/Collaboration';
import { Settings } from '../models/Plugins';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";

@Injectable()
export class CollaborationServices {

    private serviceName = "Collaboration";

    constructor(private httpMgr: HttpManager) { }

    /**
     * 
     */
    getCollaborationSystemStatus(): 
        Observable<{ backendId: string, enabled: boolean, linked: boolean, projSettingsConfigured: boolean, userSettingsConfigured: boolean }> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getCollaborationSystemStatus", params);
    }

    /**
     * Gets the settings to be set to the collaboration backend (mainly the serverURL)
     * @param backendId
     */
    getProjectSettings(backendId: string): Observable<Settings> {
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
     */
    activateCollaboratioOnProject(backendId: string) {
        var params: any = {
            backendId: backendId
        };
        return this.httpMgr.doPost(this.serviceName, "activateCollaboratioOnProject", params);
    }

    /**
     * 
     * @param backendId 
     * @param currentUserPreferences 
     */
    addPreferencesForCurrentUser(backendId: string, currentUserPreferences: any) {
        var params: any = {
            backendId: backendId,
            currentUserPreferences: JSON.stringify(currentUserPreferences)
        };
        return this.httpMgr.doPost(this.serviceName, "addPreferencesForCurrentUser", params);
    }

    /**
     * 
     */
    getIssueCreationForm(): Observable<Settings> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getIssueCreationForm", params).map(
            stResp => {
                return Settings.parse(stResp);
            }
        );
    }

    /**
     * 
     * @param resource 
     * @param issueCreationForm a map key-value
     */
    createIssue(resource: ARTURIResource, issueCreationForm: any) {
        var params: any = {
            resource: resource,
            issueCreationForm: JSON.stringify(issueCreationForm)
        };
        return this.httpMgr.doPost(this.serviceName, "createIssue", params);
    }

    /**
     * 
     * @param projectName 
     * @param projectKey 
     * @param projectId 
     */
    assignProject(projectJson: any) {
        var params: any = {
            projectJson: JSON.stringify(projectJson)
        };
        return this.httpMgr.doPost(this.serviceName, "assignProject", params);
    }

    /**
     * 
     * @param projectName 
     * @param projectKey 
     */
    createProject(projectJson: any) {
        var params: any = {
            projectJson: JSON.stringify(projectJson)
        };
        return this.httpMgr.doPost(this.serviceName, "createProject", params);
    }

    /**
     * 
     * @param issue 
     * @param resource 
     */
    assignResourceToIssue(issue: string, resource: ARTURIResource) {
        var params: any = {
            issue: issue,
            resource: resource
        };
        return this.httpMgr.doPost(this.serviceName, "assignResourceToIssue", params);
    }

    /**
     * 
     * @param resource 
     */
    listIssuesAssignedToResource(resource: ARTURIResource): Observable<Issue[]> {
        var params: any = {
            resource: resource
        };
        var options: VBRequestOptions = new VBRequestOptions({
            errorAlertOpt: { 
                show: true, 
                exceptionsToSkip: [
                    'java.net.ConnectException',
                    'it.uniroma2.art.semanticturkey.extension.extpts.collaboration.CollaborationBackendException'
                ]
            } 
        });
        return this.httpMgr.doGet(this.serviceName, "listIssuesAssignedToResource", params, options).map(
            resp => {
                let issues: Issue[] = CollaborationUtils.parseIssues(resp);
                CollaborationUtils.sortIssues(issues, "id");
                return issues;
            }
        );
    }

    /**
     * 
     */
    listProjects(): Observable<{ headers: string[], projects: any[] }> {
        var params: any = {};
        var options: VBRequestOptions = new VBRequestOptions({
            errorAlertOpt: { 
                show: true, 
                exceptionsToSkip: [
                    'java.net.ConnectException',
                    'it.uniroma2.art.semanticturkey.extension.extpts.collaboration.CollaborationBackendException'
                ]
            } 
        });
        return this.httpMgr.doGet(this.serviceName, "listProjects", params, options);
    }

    /**
     * 
     */
    listIssues(pageOffset: number): Observable<IssuesStruct> {
        var params: any = {
            pageOffset: pageOffset
        };
        var options: VBRequestOptions = new VBRequestOptions({
            errorAlertOpt: { 
                show: true, 
                exceptionsToSkip: [
                    'java.net.ConnectException',
                    'it.uniroma2.art.semanticturkey.extension.extpts.collaboration.CollaborationBackendException'
                ]
            } 
        });
        return this.httpMgr.doGet(this.serviceName, "listIssues", params, options).map(
            stResp => {
                let issues: Issue[] = CollaborationUtils.parseIssues(stResp.issues);
                CollaborationUtils.sortIssues(issues, "id", true);
                let issuesStruct: IssuesStruct = {
                    issues: issues, 
                    more: stResp.more,
                    numIssues: stResp.numIssues,
                    numPagesTotal: stResp.numPagesTotal
                }
                return issuesStruct;
            }
        );
    }

}