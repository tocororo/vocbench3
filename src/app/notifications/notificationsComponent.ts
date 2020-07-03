import { Component } from "@angular/core";
import { Modal, OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder } from "ngx-modialog/plugins/bootstrap";
import { ARTResource, ARTURIResource } from "../models/ARTResources";
import { Notification } from "../models/Notifications";
import { ResourcesServices } from "../services/resourcesServices";
import { NotificationServices } from "../services/notificationServices";
import { Deserializer } from "../utils/Deserializer";
import { ResourceUtils } from "../utils/ResourceUtils";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { NotificationSettingsModal } from "./notificationSettingsModal";

@Component({
    selector: "notifications-component",
    templateUrl: "./notificationsComponent.html",
    host: { class: "pageComponent" }
})
export class NotificationsComponent {

    private notifications: EnrichedNotification[];
    private sortOrder: SortOrder = SortOrder.TIME_ASCENDING;

    constructor(private notificationsService: NotificationServices, private resourceService: ResourcesServices,
        private sharedModals: SharedModalServices, private modal: Modal) { }

    ngOnInit() {
        this.init();
    }

    private init() {
        this.notificationsService.listNotifications().subscribe(
            notifications => {
                //collect resources to annotate
                let resources: ARTURIResource[] = <ARTURIResource[]> notifications.map(n => n.resource) //get only resource id
                    .filter((r, pos, list) => list.indexOf(r) == pos) //filter out duplicates
                    .map(r => ResourceUtils.parseNode(r)) //convert id to ARTResource
                    .filter(r => r instanceof ARTURIResource); //filter out BNode

                this.resourceService.getResourcesInfo(resources).subscribe(
                    annotatedRes => {
                        this.notifications = [];
                        notifications.forEach(n => {
                            let enrichedNotification: EnrichedNotification = {
                                resource: n.resource,
                                role: n.role,
                                action: n.action,
                                timestamp: n.timestamp,
                                //enrichment
                                annotatedRes: annotatedRes.find(aRes => n.resource == aRes.toNT()),
                                roleShow: ResourceUtils.getResourceRoleLabel(n.role),
                                timestampShow: Deserializer.parseDateTime(n.timestamp)
                            }
                            this.notifications.push(enrichedNotification);
                        })
                        //sort by date from newest to oldest
                        this.changeTimeOrder();
                    }
                )
                
            }
        );
    }

    private clear() {
        this.notificationsService.clearNotifications().subscribe(
            () => {
                this.init();
            }
        )
    }

    private settings() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(NotificationSettingsModal, overlayConfig);
    }

    private openResource(resource: ARTResource) {
        this.sharedModals.openResourceView(resource, true);
    }

    private changeResourceOrder() {
        if (this.sortOrder == SortOrder.RESOURCE_ASCENDING) {
            this.sortOrder = SortOrder.RESOURCE_DESCENDING;
            this.notifications.sort((n1, n2) => {
                return -n1.annotatedRes.getShow().localeCompare(n2.annotatedRes.getShow());
            });
        } else { //in case is resource descending or any other order active
            this.sortOrder = SortOrder.RESOURCE_ASCENDING;
            this.notifications.sort((n1, n2) => {
                return n1.annotatedRes.getShow().localeCompare(n2.annotatedRes.getShow());
            });
        }
    }
    private changeRoleOrder() {
        if (this.sortOrder == SortOrder.ROLE_ASCENDING) {
            this.sortOrder = SortOrder.ROLE_DESCENDING;
            this.notifications.sort((n1, n2) => {
                return -n1.role.localeCompare(n2.role);
            });
        } else { //in case is role descending or any other order active
            this.sortOrder = SortOrder.ROLE_ASCENDING;
            this.notifications.sort((n1, n2) => {
                return n1.role.localeCompare(n2.role);
            });
        }
    }
    private changeActionOrder() {
        if (this.sortOrder == SortOrder.ACTION_ASCENDING) {
            this.sortOrder = SortOrder.ACTION_DESCENDING;
            this.notifications.sort((n1, n2) => {
                return -n1.action.localeCompare(n2.action);
            });
        } else { //in case is action descending or any other order active
            this.sortOrder = SortOrder.ACTION_ASCENDING;
            this.notifications.sort((n1, n2) => {
                return n1.action.localeCompare(n2.action);
            });
        }
    }
    private changeTimeOrder() {
        if (this.sortOrder == SortOrder.TIME_ASCENDING) {
            this.sortOrder = SortOrder.TIME_DESCENDING;
            this.notifications.sort((n1, n2) => {
                return -n1.timestamp.getTime() - n2.timestamp.getTime();
            });
        } else { //in case is time descending or any other order active
            this.sortOrder = SortOrder.TIME_ASCENDING;
            this.notifications.sort((n1, n2) => {
                return n1.timestamp.getTime() - n2.timestamp.getTime();
            });
        }
    }

}

class SortOrder {
    public static RESOURCE_DESCENDING: string = "resource_descending";
    public static RESOURCE_ASCENDING: string = "resource_ascending";
    public static ROLE_DESCENDING: string = "role_descending";
    public static ROLE_ASCENDING: string = "role_ascending";
    public static ACTION_DESCENDING: string = "action_descending";
    public static ACTION_ASCENDING: string = "action_ascending";
    public static TIME_DESCENDING: string = "time_descending";
    public static TIME_ASCENDING: string = "time_ascending";
}

class EnrichedNotification extends Notification {
    annotatedRes: ARTURIResource;
    roleShow: string;
    timestampShow: string;
}