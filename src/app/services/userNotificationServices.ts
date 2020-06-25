import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { HttpManager } from "../utils/HttpManager";
import { Action, NotificationPreferences } from '../models/Notifications';

@Injectable()
export class UserNotificationServices {

    private serviceName = "UserNotification";

    constructor(private httpMgr: HttpManager) { }

    /**
     * 
     * @param resource 
     */
    startWatching(resource: ARTResource): Observable<void> {
        let params: any = {
            resource: resource
        };
        return this.httpMgr.doPost(this.serviceName, "startWatching", params);
    }

    /**
     * 
     * @param resource 
     */
    stopWatching(resource: ARTResource): Observable<void> {
        let params: any = {
            resource: resource
        };
        return this.httpMgr.doPost(this.serviceName, "stopWatching", params);
    }

    /**
     * 
     * @param resource 
     */
    isWatching(resource: ARTResource): Observable<boolean> {
        let params: any = {
            resource: resource
        };
        return this.httpMgr.doGet(this.serviceName, "isWatching", params);
    }

    /**
     * 
     */
    listWatching(): Observable<void> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listWatching", params);
    }

    /**
     * 
     */
    getNotificationPreferences(): Observable<NotificationPreferences> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getNotificationPreferences", params);
    }

    /**
     * 
     * @param preferences 
     */
    storeNotificationPreferences(preferences: NotificationPreferences) {
        let params: any = {
            preferences: JSON.stringify(preferences)
        };
        return this.httpMgr.doPost(this.serviceName, "storeNotificationPreferences", params);
    }

    /**
     * 
     * @param role 
     * @param action 
     * @param status 
     */
    updateNotificationPreferences(role: RDFResourceRolesEnum, action: Action, status: boolean) {
        let params: any = {
            role: role,
            action: action,
            status: status,
        };
        return this.httpMgr.doPost(this.serviceName, "updateNotificationPreferences", params);
    }


    // /**
    //  * 
    //  */
    // searchResourceFromUser(): Observable<string[]> {
    //     let params: any = {};
    //     return this.httpMgr.doGet(this.serviceName, "searchResourceFromUser", params);
    // }

    // /**
    //  * 
    //  */
    // searchProjRoleActionFromUser(userId: string): Observable<string[]> {
    //     let params: any = {
    //         userId: userId
    //     };
    //     return this.httpMgr.doGet(this.serviceName, "searchProjRoleActionFromUser", params);
    // }

    // /**
    //  * 
    //  */
    // searchUserFromProjRes(proj: string, res: ARTURIResource): Observable<string[]> {
    //     let params: any = {
    //         proj: proj,
    //         res: res,
    //     };
    //     return this.httpMgr.doGet(this.serviceName, "searchUserFromProjRes", params);
    // }

    // /**
    //  * 
    //  */
    // searchUserFromProjRoleAction(proj: string, role: RDFResourceRolesEnum, action: Action): Observable<string[]> {
    //     let params: any = {};
    //     return this.httpMgr.doGet(this.serviceName, "searchResourceFromUser", params);
    // }

    // /**
    //  * 
    //  */
    // addToUserWithRes(user: string, projId: string, res: ARTURIResource): Observable<string> {
    //     let params: any = {};
    //     return this.httpMgr.doPost(this.serviceName, "addToUserWithRes", params);
    // }

    // /**
    //  * 
    //  */
    // addToUserWithRole(user: string, projId: string, role: RDFResourceRolesEnum, action: Action): Observable<string> {
    //     let params: any = {};
    //     return this.httpMgr.doPost(this.serviceName, "addToUserWithRes", params);
    // }

    // /**
    //  * 
    //  */
    // removeUser(user: string): Observable<string> {
    //     let params: any = {};
    //     return this.httpMgr.doPost(this.serviceName, "addToUserWithRes", params);
    // }

    // /**
    //  * 
    //  */
    // removeProjRoleActionFromUser(user: string, projId: string, role: RDFResourceRolesEnum, action: Action): Observable<string> {
    //     let params: any = {};
    //     return this.httpMgr.doPost(this.serviceName, "removeProjRoleActionFromUser", params);
    // }


}
