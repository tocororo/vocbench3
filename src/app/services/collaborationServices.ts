import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, skip } from 'rxjs/operators';
import { ARTURIResource } from '../models/ARTResources';
import { CollaborationSystemStatus, CollaborationUtils, Issue, IssuesStruct } from '../models/Collaboration';
import { Settings } from '../models/Plugins';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";

@Injectable()
export class CollaborationServices {

    private serviceName = "Collaboration";

    constructor(private httpMgr: HttpManager) { }

    /**
     * 
     */
    getCollaborationSystemStatus(): Observable<CollaborationSystemStatus> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getCollaborationSystemStatus", params);
    }

    /**
     * Gets the settings to be set to the collaboration backend (mainly the serverURL)
     * @param backendId
     */
    getProjectSettings(backendId: string): Observable<Settings> {
        let params: any = {
            backendId: backendId,
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectSettings", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }

    /**
     * Gets the preferences to be set to the collaboration backend (likely username and password)
     * @param backendId
     */
    getProjectPreferences(backendId: string): Observable<Settings> {
        let params: any = {
            backendId: backendId,
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectPreferences", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }

    /**
     * Activate the collaboration system on the current project
     * @param backendId 
     */
    activateCollaboratioOnProject(backendId: string) {
        let params: any = {
            backendId: backendId
        };
        return this.httpMgr.doPost(this.serviceName, "activateCollaboratioOnProject", params);
    }

    resetCollaborationOnProject() {
        let params: any = {};
        return this.httpMgr.doPost(this.serviceName, "resetCollaborationOnProject", params);
    }

    /**
     * Changes the status (enable/disable) of the CS. This is supposed to be used only when CS is working/configured
     * @param active
     */
    setCollaborationSystemActive(active: boolean) {
        let params: any = {
            active: active
        };
        return this.httpMgr.doPost(this.serviceName, "setCollaborationSystemActive", params);
    }

    /**
     * 
     * @param backendId 
     * @param currentUserPreferences 
     */
    addPreferencesForCurrentUser(backendId: string, currentUserPreferences: any) {
        let params: any = {
            backendId: backendId,
            currentUserPreferences: JSON.stringify(currentUserPreferences)
        };
        return this.httpMgr.doPost(this.serviceName, "addPreferencesForCurrentUser", params);
    }

    /**
     * 
     */
    getIssueCreationForm(): Observable<Settings> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getIssueCreationForm", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }

    /**
     * 
     * @param resource 
     * @param issueCreationForm a map key-value
     */
    createIssue(resource: ARTURIResource, issueCreationForm: any) {
        let params: any = {
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
        let params: any = {
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
        let params: any = {
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
        let params: any = {
            issue: issue,
            resource: resource
        };
        return this.httpMgr.doPost(this.serviceName, "assignResourceToIssue", params);
    }

    /**
     * 
     * @param issue 
     * @param resource 
     */
    removeResourceFromIssue(issue: string, resource: ARTURIResource) {
        let params: any = {
            issue: issue,
            resource: resource
        };
        return this.httpMgr.doPost(this.serviceName, "removeResourceFromIssue", params);
    }

    /**
     * 
     * @param resource 
     */
    listIssuesAssignedToResource(resource: ARTURIResource): Observable<Issue[]> {
        let params: any = {
            resource: resource
        };
        let options: VBRequestOptions = new VBRequestOptions({
            errorHandlers: [
                { className: 'java.net.ConnectException', action: 'skip' },
                { className: 'it.uniroma2.art.semanticturkey.extension.extpts.collaboration.CollaborationBackendException', action: 'skip' },
            ]
        });
        return this.httpMgr.doGet(this.serviceName, "listIssuesAssignedToResource", params, options).pipe(
            map(resp => {
                let issues: Issue[] = CollaborationUtils.parseIssues(resp);
                CollaborationUtils.sortIssues(issues, "id");
                return issues;
            })
        );
    }

    /**
     * 
     */
    listProjects(): Observable<{ headers: string[], projects: any[] }> {
        let params: any = {};
        let options: VBRequestOptions = new VBRequestOptions({
            errorHandlers: [
                { className: 'java.net.ConnectException', action: 'skip' },
                { className: 'it.uniroma2.art.semanticturkey.extension.extpts.collaboration.CollaborationBackendException', action: 'skip' }
            ]
        });
        return this.httpMgr.doGet(this.serviceName, "listProjects", params, options);
    }

    /**
     * 
     */
    listIssues(pageOffset: number): Observable<IssuesStruct> {
        let params: any = {
            pageOffset: pageOffset
        };
        let options: VBRequestOptions = new VBRequestOptions({
            errorHandlers: [
                { className: 'java.net.ConnectException', action: 'skip' },
                { className: 'it.uniroma2.art.semanticturkey.extension.extpts.collaboration.CollaborationBackendException', action: 'skip' }
            ]
        });
        return this.httpMgr.doGet(this.serviceName, "listIssues", params, options).pipe(
            map(stResp => {
                let issues: Issue[] = CollaborationUtils.parseIssues(stResp.issues);
                CollaborationUtils.sortIssues(issues, "id", true);
                let issuesStruct: IssuesStruct = {
                    issues: issues, 
                    more: stResp.more,
                    numIssues: stResp.numIssues,
                    numPagesTotal: stResp.numPagesTotal
                }
                return issuesStruct;
            })
        );
    }

}