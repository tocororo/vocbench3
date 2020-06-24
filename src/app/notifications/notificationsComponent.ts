import { Component } from "@angular/core";
import { UserNotificationServices } from "../services/userNotificationServices";

@Component({
    selector: "notifications-component",
    templateUrl: "./notificationsComponent.html",
    host: { class: "pageComponent" }
})
export class NotificationsComponent {

    constructor(private notificationsService: UserNotificationServices) { }

    ngOnInit() {
    }

    // startWatching() {
    //     this.notificationsService.startWatching(this.resource).subscribe();
    // }
    // stopWatching() {
    //     this.notificationsService.stopWatching(this.resource).subscribe();
    // }
    // listWatching() {
    //     this.notificationsService.listWatching().subscribe();
    // }

    // isWatching() {
    //     this.notificationsService.isWatching(this.resource).subscribe();
    // }

}