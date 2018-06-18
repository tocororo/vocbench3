import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTURIResource } from '../models/ARTResources';
import { ProjectGroupBinding, UsersGroup } from "../models/User";
import { HttpManager } from "../utils/HttpManager";
import { ResourcesServices } from './resourcesServices';

@Injectable()
export class UsersGroupsServices {

    private serviceName = "UsersGroups";

    constructor(private httpMgr: HttpManager, private resourcesService: ResourcesServices) { }

    /**
     * 
     */
    listGroups(): Observable<UsersGroup[]> {
        console.log("[UsersGroupServices] listGroups");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listGroups", params).map(
            resp => {
                let groups: UsersGroup[] = [];
                for (var i = 0; i < resp.length; i++) {
                    groups.push(UsersGroup.deserialize(resp[i]));
                }

                groups.sort((g1: UsersGroup, g2: UsersGroup) => {
                    return g1.shortName.localeCompare(g2.shortName);
                })

                return groups;
            }
        );
    }

    /**
     * 
     * @param groupIri 
     */
    getGroup(groupIri: ARTURIResource): Observable<UsersGroup> {
        console.log("[UsersGroupServices] getGroup");
        var params: any = {
            groupIri: groupIri
        };
        return this.httpMgr.doGet(this.serviceName, "getGroup", params).map(
            resp => {
                return UsersGroup.deserialize(resp);
            }
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
        console.log("[UsersGroupServices] createGroup");
        var params: any = {
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
        return this.httpMgr.doPost(this.serviceName, "createGroup", params).map(
            resp => {
                return UsersGroup.deserialize(resp);
            }
        );
    }

    /**
     * 
     * @param groupName 
     * @param shortName 
     */
    updateGroupShortName(groupIri: ARTURIResource, shortName: string): Observable<UsersGroup> {
        console.log("[UsersGroupServices] updateGroupShortName");
        var params: any = {
            groupIri: groupIri,
            shortName: shortName
        };
        return this.httpMgr.doPost(this.serviceName, "updateGroupShortName", params).map(
            resp => {
                return UsersGroup.deserialize(resp);
            }
        );
    }

    /**
     * 
     * @param groupName 
     * @param fullName 
     */
    updateGroupFullName(groupIri: ARTURIResource, fullName: string): Observable<UsersGroup> {
        console.log("[UsersGroupServices] updateGroupFullName");
        var params: any = {
            groupIri: groupIri,
            fullName: fullName
        };
        return this.httpMgr.doPost(this.serviceName, "updateGroupFullName", params).map(
            resp => {
                return UsersGroup.deserialize(resp);
            }
        );
    }

    /**
     * 
     * @param groupName 
     * @param description 
     */
    updateGroupDescription(groupIri: ARTURIResource, description: string): Observable<UsersGroup> {
        console.log("[UsersGroupServices] updateGroupDescription");
        var params: any = {
            groupIri: groupIri,
            description: description
        };
        return this.httpMgr.doPost(this.serviceName, "updateGroupDescription", params).map(
            resp => {
                return UsersGroup.deserialize(resp);
            }
        );
    }

    /**
     * 
     * @param groupName 
     * @param webPage 
     */
    updateGroupWebPage(groupIri: ARTURIResource, webPage: string): Observable<UsersGroup> {
        console.log("[UsersGroupServices] updateGroupWebPage");
        var params: any = {
            groupIri: groupIri,
            webPage: webPage
        };
        return this.httpMgr.doPost(this.serviceName, "updateGroupWebPage", params).map(
            resp => {
                return UsersGroup.deserialize(resp);
            }
        );
    }

    /**
     * 
     * @param groupName 
     * @param logoUrl 
     */
    updateGroupLogoUrl(groupIri: ARTURIResource, logoUrl: string): Observable<UsersGroup> {
        console.log("[UsersGroupServices] updateGroupLogoUrl");
        var params: any = {
            groupIri: groupIri,
            logoUrl: logoUrl
        };
        return this.httpMgr.doPost(this.serviceName, "updateGroupLogoUrl", params).map(
            resp => {
                return UsersGroup.deserialize(resp);
            }
        );
    }

    /**
     * 
     * @param groupName 
     */
    deleteGroup(groupIri: ARTURIResource) {
        console.log("[UsersGroupServices] deleteGroup");
        var params: any = {
            groupIri: groupIri
        };
        return this.httpMgr.doPost(this.serviceName, "deleteGroup", params);
    }

    /**
     * Assigns group to a user in a project
     * @param projectName
     * @param email
     * @param groupName
     */
    assignGroupToUser(projectName: string, email: string, groupIri: ARTURIResource) {
        console.log("[UsersGroupServices] assignGroupToUser");
        var params: any = {
            projectName: projectName,
            email: email,
            groupIri: groupIri
        };
        return this.httpMgr.doPost(this.serviceName, "assignGroupToUser", params);
    }

    /**
     * Removes a role to a user in a project
     * @param projectName
     * @param email
     */
    removeGroupFromUser(projectName: string, email: string) {
        console.log("[UsersGroupServices] removeGroupFromUser");
        var params: any = {
            projectName: projectName,
            email: email
        };
        return this.httpMgr.doPost(this.serviceName, "removeGroupFromUser", params);
    }

    /**
     * 
     * @param projectName 
     * @param groupIri 
     * @param scheme 
     */
    addOwnedSchemeToGroup(projectName: string, groupIri: ARTURIResource, scheme: ARTURIResource) {
        console.log("[UsersGroupServices] addOwnedSchemeToGroup");
        var params: any = {
            projectName: projectName,
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
    removeOwnedSchemeFromGroup(projectName: string, groupIri: ARTURIResource, scheme: ARTURIResource) {
        console.log("[UsersGroupServices] removeOwnedSchemeFromGroup");
        var params: any = {
            projectName: projectName,
            groupIri: groupIri,
            scheme: scheme
        };
        return this.httpMgr.doPost(this.serviceName, "removeOwnedSchemeFromGroup", params);
    }

    /**
     * 
     * @param projectName 
     * @param groupIri 
     */
    getProjectGroupBinding(projectName: string, groupIri: ARTURIResource): Observable<ProjectGroupBinding> {
        console.log("[UsersGroupServices] getProjectGroupBinding");
        var params: any = {
            projectName: projectName,
            groupIri: groupIri
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectGroupBinding", params);
    }

}