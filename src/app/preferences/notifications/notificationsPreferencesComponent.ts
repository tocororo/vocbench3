import { Component, Input } from "@angular/core";
import { RDFResourceRolesEnum, ARTResource, ARTURIResource } from "../../models/ARTResources";
import { Action, NotificationPreferences } from "../../models/Notifications";
import { NotificationStatus } from "../../models/Properties";
import { UserNotificationServices } from "../../services/userNotificationServices";
import { ResourceUtils, SortAttribute } from "../../utils/ResourceUtils";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { ResourcesServices } from "../../services/resourcesServices";

@Component({
    selector: "notifications-pref",
    templateUrl: "./notificationsPreferencesComponent.html",
    host: { class: "vbox" }
})
export class NotificationsPreferencesComponent {

    @Input() hideModeChange: boolean = false;

    //Notification options

    private notificationOptions: NotificationPrefStruct[] = [
        { value: NotificationStatus.no_notifications, show: "No notifications", description: "You will not receive any notification" },
        { value: NotificationStatus.in_app_only, show: "In-app only", description: "You will be able to read notifications only in app from a dedicated page" },
        { value: NotificationStatus.email_instant, show: "Email (instant)", description: "You will receive email instantly" },
        { value: NotificationStatus.email_daily_digest, show: "Email (daily digest)", description: "You will receive a daily email report" },
    ];
    private activeNotificationOpt: NotificationPrefStruct;

    //Notifications matrix

    private actions: Action[] = [Action.creation, Action.deletion, Action.update];
    private roleStructs: RoleStruct[];

    private notificationTable: NotificationTable;

    private preferences: NotificationPreferences;

    //Watching resources
    private watchingResources: ARTResource[];

    constructor(private notificationsService: UserNotificationServices, private resourceService: ResourcesServices, private vbProp: VBProperties) { }

    ngOnInit() {
        //init active notification option
        this.activeNotificationOpt = this.notificationOptions.find(o => o.value == VBContext.getWorkingProjectCtx().getProjectPreferences().notificationStatus);

        //init notifications matrix
        this.notificationsService.getNotificationPreferences().subscribe(
            prefs => {
                this.preferences = prefs;
                this.roleStructs = Object.keys(this.preferences)
                    .map(r => {
                        let role: RDFResourceRolesEnum = <RDFResourceRolesEnum>r;
                        return { role: role, show: ResourceUtils.getResourceRoleLabel(role) }
                    })
                    .sort((rs1, rs2) => rs1.show.localeCompare(rs2.show));
                //prepare the table struct based on the response
                this.notificationTable = {};
                this.roleStructs.forEach(
                    rs => {
                        this.notificationTable[rs.role] = {
                            creation: this.preferences[rs.role].indexOf(Action.creation) != -1,
                            deletion: this.preferences[rs.role].indexOf(Action.deletion) != -1,
                            update: this.preferences[rs.role].indexOf(Action.update) != -1,
                        }
                    }
                );
            }
        );

        //init list of watching resources
        this.notificationsService.listWatching().subscribe(
            watchingResources => {
                let resources: ARTURIResource[] = [];
                watchingResources.forEach(r => {
                    let res = ResourceUtils.parseNode(r);
                    if (res instanceof ARTURIResource) {
                        resources.push(res);
                    }
                })
                this.resourceService.getResourcesInfo(resources).subscribe(
                    annotatedRes => {
                        this.watchingResources = annotatedRes;
                        ResourceUtils.sortResources(this.watchingResources, SortAttribute.show);
                    }
                );
            }
        );
    }

    //============ Notification option handler ============

    private changeNotificationStatus() {
        this.vbProp.setNotificationStatus(this.activeNotificationOpt.value);
    }

    //============ Notification matrix handler ============

    private checkAllActions(status: boolean) {
        for (let role in this.notificationTable) {
            this.notificationTable[role].creation = status;
            this.notificationTable[role].deletion = status;
            this.notificationTable[role].update = status;
        }
        this.updateAllNotifications();
    }

    private checkAllActionsForRole(role: RDFResourceRolesEnum, status: boolean) {
        this.notificationTable[role].creation = status;
        this.notificationTable[role].deletion = status;
        this.notificationTable[role].update = status;
        this.updateAllNotifications();
    }

    private updateAllNotifications() {
        let pref: NotificationPreferences = {};
        for (let role in this.notificationTable) {
            let activeAction: Action[] = []
            if (this.notificationTable[role].creation) {
                activeAction.push(Action.creation)
            }
            if (this.notificationTable[role].deletion) {
                activeAction.push(Action.deletion)
            }
            if (this.notificationTable[role].update) {
                activeAction.push(Action.update)
            }
            pref[role] = activeAction;
        }
        this.notificationsService.storeNotificationPreferences(pref).subscribe()
    }

    private updateNotificationPref(role: RDFResourceRolesEnum, action: Action) {
        this.notificationsService.updateNotificationPreferences(role, action, this.notificationTable[role][action]).subscribe();
    }

    //============ Watching resources handler ============

    private stopWatching(resource: ARTResource) {
        this.notificationsService.stopWatching(resource).subscribe(
            () => {
                this.watchingResources.splice(this.watchingResources.indexOf(resource), 1);
            }
        )
    }

}

interface NotificationTable { [key: string]: ActionsNotificationStruct } 
interface ActionsNotificationStruct {
    creation: boolean;
    deletion: boolean;
    update: boolean;
}

interface RoleStruct {
    role: RDFResourceRolesEnum;
    show: string;
}

interface NotificationPrefStruct {
    value: NotificationStatus;
    show: string;
    description: string;
}