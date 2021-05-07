import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTURIResource } from '../models/ARTResources';
import { Project } from '../models/Project';
import { ProjectGroupBinding, UsersGroup } from "../models/User";
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class UsersGroupsServices {

    private serviceName = "UsersGroups";

    constructor(private httpMgr: HttpManager) { }

    /**
     * 
     */
    listGroups(): Observable<UsersGroup[]> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listGroups", params).pipe(
            map(resp => {
                let groups: UsersGroup[] = [];
                for (let i = 0; i < resp.length; i++) {
                    groups.push(UsersGroup.deserialize(resp[i]));
                }

                groups.sort((g1: UsersGroup, g2: UsersGroup) => {
                    return g1.shortName.localeCompare(g2.shortName);
                })
                groups.sort((g1: UsersGroup, g2: UsersGroup) => g1.shortName.localeCompare(g2.shortName));
                return groups;
            })
        );
    }

    /**
     * 
     * @param groupIri 
     */
    getGroup(groupIri: ARTURIResource): Observable<UsersGroup> {
        let params: any = {
            groupIri: groupIri
        };
        return this.httpMgr.doGet(this.serviceName, "getGroup", params).pipe(
            map(resp => {
                return UsersGroup.deserialize(resp);
            })
        );
    }

    /**
     * 
     * @param shortName 
     * @param fullName 
     * @param description 
     * @param webPage 
     * @param logoUrl 
     */
    createGroup(shortName: string, fullName?: string, description?: string, webPage?: string, logoUrl?: string, iri?: string): Observable<UsersGroup> {
        let params: any = {
            shortName: shortName
        };
        if (fullName != null) {
            params.fullName = fullName;
        }
        if (description != null) {
            params.description = description;
        }
        if (webPage != null) {
            params.webPage = webPage;
        }
        if (logoUrl != null) {
            params.logoUrl = logoUrl;
        }
        return this.httpMgr.doPost(this.serviceName, "createGroup", params).pipe(
            map(resp => {
                return UsersGroup.deserialize(resp);
            })
        );
    }

    /**
     * 
     * @param groupName 
     * @param shortName 
     */
    updateGroupShortName(groupIri: ARTURIResource, shortName: string): Observable<UsersGroup> {
        let params: any = {
            groupIri: groupIri,
            shortName: shortName
        };
        return this.httpMgr.doPost(this.serviceName, "updateGroupShortName", params).pipe(
            map(resp => {
                return UsersGroup.deserialize(resp);
            })
        );
    }

    /**
     * 
     * @param groupName 
     * @param fullName 
     */
    updateGroupFullName(groupIri: ARTURIResource, fullName: string): Observable<UsersGroup> {
        let params: any = {
            groupIri: groupIri,
            fullName: fullName
        };
        return this.httpMgr.doPost(this.serviceName, "updateGroupFullName", params).pipe(
            map(resp => {
                return UsersGroup.deserialize(resp);
            })
        );
    }

    /**
     * 
     * @param groupName 
     * @param description 
     */
    updateGroupDescription(groupIri: ARTURIResource, description: string): Observable<UsersGroup> {
        let params: any = {
            groupIri: groupIri,
            description: description
        };
        return this.httpMgr.doPost(this.serviceName, "updateGroupDescription", params).pipe(
            map(resp => {
                return UsersGroup.deserialize(resp);
            })
        );
    }

    /**
     * 
     * @param groupName 
     * @param webPage 
     */
    updateGroupWebPage(groupIri: ARTURIResource, webPage: string): Observable<UsersGroup> {
        let params: any = {
            groupIri: groupIri,
            webPage: webPage
        };
        return this.httpMgr.doPost(this.serviceName, "updateGroupWebPage", params).pipe(
            map(resp => {
                return UsersGroup.deserialize(resp);
            })
        );
    }

    /**
     * 
     * @param groupName 
     * @param logoUrl 
     */
    updateGroupLogoUrl(groupIri: ARTURIResource, logoUrl: string): Observable<UsersGroup> {
        let params: any = {
            groupIri: groupIri,
            logoUrl: logoUrl
        };
        return this.httpMgr.doPost(this.serviceName, "updateGroupLogoUrl", params).pipe(
            map(resp => {
                return UsersGroup.deserialize(resp);
            })
        );
    }

    /**
     * 
     * @param groupName 
     */
    deleteGroup(groupIri: ARTURIResource) {
        let params: any = {
            groupIri: groupIri
        };
        return this.httpMgr.doPost(this.serviceName, "deleteGroup", params);
    }

    /**
     * Assigns group to a user in a project
     * @param project
     * @param email
     * @param groupName
     */
    assignGroupToUser(project: Project, email: string, groupIri: ARTURIResource) {
        let params: any = {
            projectName: project.getName(),
            email: email,
            groupIri: groupIri
        };
        return this.httpMgr.doPost(this.serviceName, "assignGroupToUser", params);
    }

    /**
     * 
     * @param project
     * @param email
     * @param groupName
     * @param limitations
     */
    setGroupLimitationsToUser(project: Project, email: string, groupIri: ARTURIResource, limitations: boolean) {
        let params: any = {
            projectName: project.getName(),
            email: email,
            groupIri: groupIri,
            limitations: limitations
        };
        return this.httpMgr.doPost(this.serviceName, "setGroupLimitationsToUser", params);
    }

    /**
     * Removes a role to a user in a project
     * @param project
     * @param email
     */
    removeGroupFromUser(project: Project, email: string) {
        let params: any = {
            projectName: project.getName(),
            email: email
        };
        return this.httpMgr.doPost(this.serviceName, "removeGroupFromUser", params);
    }

    /**
     * 
     * @param project 
     * @param groupIri 
     * @param scheme 
     */
    addOwnedSchemeToGroup(project: Project, groupIri: ARTURIResource, scheme: ARTURIResource) {
        let params: any = {
            projectName: project.getName(),
            groupIri: groupIri,
            scheme: scheme
        };
        return this.httpMgr.doPost(this.serviceName, "addOwnedSchemeToGroup", params);
    }

    /**
     * 
     * @param projectName 
     * @param groupIri 
     * @param scheme 
     */
    removeOwnedSchemeFromGroup(project: Project, groupIri: ARTURIResource, scheme: ARTURIResource) {
        let params: any = {
            projectName: project.getName(),
            groupIri: groupIri,
            scheme: scheme
        };
        return this.httpMgr.doPost(this.serviceName, "removeOwnedSchemeFromGroup", params);
    }

    /**
     * 
     * @param project
     * @param groupIri 
     */
    getProjectGroupBinding(project: Project, groupIri: ARTURIResource): Observable<ProjectGroupBinding> {
        let params: any = {
            projectName: project.getName(),
            groupIri: groupIri
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectGroupBinding", params);
    }

}