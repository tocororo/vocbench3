import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { Action, CronDefinition, Notification, NotificationPreferences } from '../models/Notifications';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class NotificationServices {

    private serviceName = "Notifications";

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
    listWatching(): Observable<string[]> {
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

    /**
     * 
     */
    listNotifications(): Observable<Notification[]> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "listNotifications", params).pipe(
            map(stResp => {
                let notifications: Notification[] = [];
                for (let nJson of stResp) {
                    let n: Notification = {
                        resource: nJson.resource,
                        action: nJson.action,
                        role: nJson.role,
                        timestamp: new Date(nJson.timestamp)
                    };
                    notifications.push(n);
                }
                return notifications;
            })
        );
    }

    clearNotifications(): Observable<void> {
        let params: any = {};
        return this.httpMgr.doPost(this.serviceName, "clearNotifications", params);
    }




    scheduleNotificationDigest(schedule?: CronDefinition) {
        let params: any = {
            schedule: schedule != null ? JSON.stringify(schedule) : null
        };
        return this.httpMgr.doPost(this.serviceName, "scheduleNotificationDigest", params);
    }

    getAvailableTimeZoneIds(): Observable<string[]> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getAvailableTimeZoneIds", params).pipe(
            map((ids: string[]) => {
                return ids.sort();
            })
        );
    }

}
