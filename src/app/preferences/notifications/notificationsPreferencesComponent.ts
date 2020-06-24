import { Component } from "@angular/core";
import { UserNotificationServices } from "../../services/userNotificationServices";
import { NotificationPreferences, Action } from "../../models/Notifications";
import { RDFResourceRolesEnum } from "../../models/ARTResources";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";
import { Properties } from "../../models/Properties";

@Component({
    selector: "notifications-pref",
    templateUrl: "./notificationsPreferencesComponent.html",
    host: { class: "vbox" }
})
export class NotificationsPreferencesComponent {

    private notificationOptions: NotificationPrefStruct[] = [
        { value: NotificationOpt.no_notifications, show: "No notifications", description: "You will not receive any notification" },
        { value: NotificationOpt.in_app_only, show: "In-app only", description: "You will be able to read notifications in app" },
        { value: NotificationOpt.email_instant, show: "Email (instant)", description: "You will receive email instantly" },
        { value: NotificationOpt.email_daily_digest, show: "Email (daily digest)", description: "You will receive a daily email report" },
    ];
    private activeNotificationOpt: NotificationOpt;


    private actions: Action[] = [Action.creation, Action.deletion, Action.update];
    private roleStructs: RoleStruct[];

    private notificationTable: NotificationTable;

    private preferences: NotificationPreferences;

    constructor(private notificationsService: UserNotificationServices, private prefService: PreferencesSettingsServices) { }

    ngOnInit() {
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

        //Init notification status preference
        this.prefService.getPUSettings([Properties.pref_notifications_status]).subscribe(
            prefs => {
                let prefValue = prefs[Properties.pref_notifications_status];
                if (prefValue != null) {
                    let activeOptStruct = this.notificationOptions.find(opt => opt.value == prefValue);
                    if (activeOptStruct != null) { //if the preference value is valid (among the available) => set it as active
                        this.activeNotificationOpt = activeOptStruct.value;
                    }
                }
                if (this.activeNotificationOpt == null) { //if none preference is set or it is not valid => set no notification as default
                    this.activeNotificationOpt = NotificationOpt.no_notifications;
                }
            }
        );
    }

    private changeNotificationStatus(option: NotificationOpt) {
        this.activeNotificationOpt = option;
        this.prefService.setPUSetting(Properties.pref_notifications_status, this.activeNotificationOpt).subscribe();
    }


    private checkAllActions(status: boolean) {
        for (let role in this.notificationTable) {
            this.notificationTable[role].creation = status;
            this.notificationTable[role].deletion = status;
            this.notificationTable[role].update = status;
        }
        this.updateAllNotifications();
    }

    // private checkAllActionsForRole(role: RDFResourceRolesEnum, status: boolean) {
    //     this.notificationTable[role].creation = status;
    //     this.notificationTable[role].deletion = status;
    //     this.notificationTable[role].update = status;
    //     this.updateAllNotifications();
    // }

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
    value: NotificationOpt;
    show: string;
    description: string;
}
enum NotificationOpt {
    no_notifications = "no_notifications",
    in_app_only = "in_app_only",
    email_instant = "email_instant",
    email_daily_digest = "email_daily_digest",
}