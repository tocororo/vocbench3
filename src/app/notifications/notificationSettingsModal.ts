import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { UserNotificationServices } from "../services/userNotificationServices";
import { ARTResource, ARTURIResource } from "../models/ARTResources";
import { ResourcesServices } from "../services/resourcesServices";
import { ResourceUtils, SortAttribute } from "../utils/ResourceUtils";

@Component({
    selector: "notifications-settings-modal",
    templateUrl: "./notificationSettingsModal.html",
})
export class NotificationSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private watchingResources: ARTResource[];

    constructor(public dialog: DialogRef<BSModalContext>, private notificationsService: UserNotificationServices, 
        private resourceService: ResourcesServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
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

    private stopWatching(resource: ARTResource) {
        this.notificationsService.stopWatching(resource).subscribe(
            () => {
                this.watchingResources.splice(this.watchingResources.indexOf(resource), 1);
            }
        )
    }
    
    ok() {
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}